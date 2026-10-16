import { describe, expect, test } from "bun:test";
import { feature, get, many } from "engine/api";
import {
    catalogueFacts,
    choiceIssues,
    compileApi,
    compileScreen,
    compileShell,
    iconIssues,
    mergeSettings,
    screenIssues,
    settingsResource,
    shellIssues,
} from "engine/spec";
import { z } from "engine/validate";

const item = z.object({ id: z.number(), title: z.string() });
const endpoints = { products: feature({}, { list: get("/products", {}, many(item)) }) };
const seeds = {
    content: { name: "Site" },
    settings: {
        language: "en",
        languages: ["en"],
        currency: "USD",
        currencies: ["USD"],
        theme: "light",
        themes: ["light"],
    },
};
const settings = {
    locale: { default: "en", enabled: ["en", "ar"] },
    currency: { default: "USD", enabled: ["USD"] },
    theme: { default: "light", enabled: ["light"] },
    maintenance: false,
    maintenanceMessage: "",
    shell: { nav: "menu", footer: null },
};
const features = { menu: { owner: "server" as const, options: { compact: true }, ports: {}, access: [], signals: [] } };

describe("surface", () => {

    test("settings merge one record deep and seed the settings resource", () => {

        const merged = mergeSettings(
            { a: 1, locale: { default: "en", enabled: ["en"] } },
            { a: undefined, locale: { default: "ar" } },
        );

        expect(merged).toEqual({ a: 1, locale: { default: "ar", enabled: ["en"] } });
        expect(settingsResource(settings).languages).toEqual(["en", "ar"]);

    });
    test("choice, shell and screen rules name their defects", () => {

        expect(choiceIssues({ ...settings, theme: { default: "dark", enabled: ["light", "light"] } })).toHaveLength(2);
        expect(shellIssues({ nav: "missing" }, features)).toEqual(["settings.shell.nav: no feature named missing."]);
        expect(compileShell(settings.shell, features)).toEqual({
            nav: { feature: "menu", options: { compact: true } },
            footer: { feature: null, options: {} },
        });
        expect(
            screenIssues(
                [{ contents: { name: "a", path: "/api/x" } }, { contents: { name: "a", path: "/api/x" } }],
                /^\/api/,
            ),
        ).toEqual([
            "Reserved screen path: /api/x",
            "Duplicate screen name: a",
            "Duplicate screen path: /api/x",
            "Reserved screen path: /api/x",
            "schema.screens must declare the home path /.",
        ]);

    });
    test("a screen compiles its blocks and enforces the shared rules", () => {

        const issues: string[] = [];
        const { blocks } = compileScreen({
            name: "home",
            path: "/",
            blocks: [{ options: {}, features: [{ name: "menu" }, { name: "menu" }], blocks: [] }],
            access: "user",
            redirect: null,
            issues,
            client: false,
            session: true,
            backend: false,
            block: {},
            site: {},
            features,
            catalogue: catalogueFacts(endpoints),
        });

        expect(blocks).toHaveLength(1);
        expect(issues).toEqual([
            "home: exactly one feature owns the screen heading.",
            "home: a gated screen names its redirect.",
        ]);

    });
    test("without a backend every operation is off and switches are refused", () => {

        const plan = { identity: "site", endpoints, seeds, currency: "USD", backend: null, switches: {} };
        const { api, contract } = compileApi(plan);

        expect(api).toBeNull();
        expect(contract.features.products?.list).toEqual({ enabled: false });
        expect(() => compileApi({ ...plan, switches: { products: { operations: { list: true } } } })).toThrow(
            "contracts",
        );

    });
    test("with a backend the development addresses follow every connection", () => {

        const backend = {
            api: {
                context: { spec: "site", currency: "USD", sessionCookie: null, proxies: 0, tenant: null },
                connections: { primary: { baseUrl: "https://api.test/v1" } },
            },
            overrides: {},
            development: { baseUrl: "http://127.0.0.1:8787/v1", browserBaseUrl: null },
            insecure: false,
        };
        const { api } = compileApi({ identity: "site", endpoints, seeds, currency: "USD", backend, switches: {} });

        expect(api?.connections.primary?.development?.baseUrl).toBe("http://127.0.0.1:8787/v1");

    });

});
describe("shell parts", () => {

    test("a shell part may carry options for its feature, checked against the manifest", () => {

        const shell = { nav: { feature: "menu", options: { compact: false } }, footer: null };

        expect(shellIssues(shell, features)).toEqual([]);
        expect(compileShell(shell, features)).toEqual({
            nav: { feature: "menu", options: { compact: false } },
            footer: { feature: null, options: {} },
        });
        expect(shellIssues({ nav: { feature: "menu", options: { compact: "x" } } }, features)).toHaveLength(1);
        expect(shellIssues({ nav: { feature: "menu", options: { nope: true } } }, features)).toHaveLength(1);

    });

});
describe("feature slugs", () => {

    test("every compiled feature carries a stable DOM-safe slug, unique per screen", () => {

        const issues: string[] = [];
        const { blocks } = compileScreen({
            name: "home",
            path: "/",
            blocks: [{ options: {}, features: [{ name: "menu", heading: true }, { name: "menu" }], blocks: [] }],
            access: "any",
            redirect: null,
            issues,
            client: false,
            session: true,
            backend: false,
            block: {},
            site: {},
            features,
            catalogue: catalogueFacts(endpoints),
        });

        expect(blocks[0]?.features.map(( entry ) => entry.slug)).toEqual(["home-menu", "home-menu-2"]);

    });

});
describe("signals in the compiler", () => {

    const facts = catalogueFacts({
        products: feature({}, { list: get("/products", { search: z.string().optional() }, many(item)) }),
    });
    const manifests = {
        box: { owner: "client" as const, options: {}, ports: {}, access: [], signals: ["search"] },
        list: {
            owner: "client" as const,
            options: {},
            ports: { items: { kind: "list" as const } },
            access: [],
            signals: [],
        },
        shelf: {
            owner: "server" as const,
            options: {},
            ports: { items: { kind: "list" as const } },
            access: [],
            signals: [],
        },
    };
    const plan = ( features: unknown[] ) => ({
        name: "home",
        path: "/",
        blocks: [{ options: {}, features: features as never, blocks: [] }],
        access: "any",
        redirect: null,
        issues: [] as string[],
        client: true,
        session: true,
        backend: true,
        block: {},
        site: {},
        features: manifests,
        catalogue: facts,
    });

    test("a signal read must be emitted by a feature on the same screen and consumed by a client feature", () => {

        const good = plan([
            { name: "box", heading: true },
            { name: "list", ports: { items: { read: "products.list", input: { search: { signal: "search" } } } } },
        ]);
        const orphan = plan([
            {
                name: "list",
                heading: true,
                ports: { items: { read: "products.list", input: { search: { signal: "search" } } } },
            },
        ]);
        const server = plan([
            { name: "box", heading: true },
            { name: "shelf", ports: { items: { read: "products.list", input: { search: { signal: "search" } } } } },
        ]);

        compileScreen(good);
        compileScreen(orphan);
        compileScreen(server);
        expect(good.issues).toEqual([]);
        expect(orphan.issues).toEqual(["home: signal search is read but no feature on the screen emits it."]);
        expect(
            server.issues.some(( issue ) => issue.includes("signal-driven or live port needs a client-owned feature")),
        ).toBe(true);

    });
    test("a live port needs a realtime contract and a client-owned feature, and compiles its channel", () => {

        const binding = { read: "products.list", live: { channel: "catalog.1", events: ["catalog.event"] } };
        const dark = plan([{ name: "list", heading: true, ports: { items: binding } }]);
        const lit = { ...plan([{ name: "list", heading: true, ports: { items: binding } }]), realtime: true };
        const server = {
            ...plan([
                { name: "box", heading: true },
                { name: "shelf", ports: { items: binding } },
            ]),
            realtime: true,
        };

        compileScreen(dark);
        expect(dark.issues).toEqual(["home.blocks[0].features[0].ports.items: a live port needs contracts.realtime."]);

        const compiled = compileScreen(lit);

        expect(lit.issues).toEqual([]);
        expect(compiled.blocks[0]?.features[0]?.ports.items).toMatchObject({
            kind: "read",
            live: { channel: "catalog.1", events: ["catalog.event"] },
        });
        compileScreen(server);
        expect(server.issues.some(( issue ) => issue.includes("live port needs a client-owned feature"))).toBe(true);

    });

});
describe("icons", () => {

    test("a screen icon must belong to the surface's icon set", () => {

        const screens = [
            { contents: { name: "a", path: "/", icon: "grid" } },
            { contents: { name: "b", path: "/b", icon: "nope" } },
        ];

        expect(iconIssues(screens, ["grid"])).toEqual(["b: no icon named nope; the surface knows grid."]);
        expect(iconIssues(screens, undefined)).toEqual([]);

    });

});
