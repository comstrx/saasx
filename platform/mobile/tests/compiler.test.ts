import { describe, expect, test } from "bun:test";
import { get, many, post, z } from "engine/api";
import { type Catalogue, catalogueFacts, type Features } from "engine/spec";
import { block, feature, read, screen, signal, type Tree, t, validateSpec, write } from "../src/lib/spec/surface.ts";

const messages = { en: { nav: { home: "Home" } }, ar: { nav: { home: "الرئيسية" } } };
const item = z.object({ id: z.number(), title: z.string() });
const catalogue: Catalogue = catalogueFacts({
    products: {
        list: get("/products", { limit: z.number().optional() }, many(item)),
        view: get("/products/{id}", { id: z.number() }, item),
        save: post("/products", { title: z.string() }, item),
    },
});
const features: Features = {
    cards: { owner: "client", options: { columns: 2, loading: "x", failed: "x", offline: "x", cached: "x", empty: "x" }, ports: { items: { kind: "list", fields: ["title"] } }, access: [], signals: [] },
    hero: { owner: "client", options: {}, ports: {}, access: [], signals: [] },
    editor: { owner: "client", options: { failed: "x", errors: {} }, ports: { save: { kind: "write" } }, access: ["user"], signals: [] },
    table: { owner: "client", options: { select: false, loading: "x", failed: "x", offline: "x", cached: "x", empty: "x" }, ports: { rows: { kind: "list", fields: ["title"] } }, access: [], signals: ["selected"] },
    detail: { owner: "client", options: { loading: "x", failed: "x", offline: "x", cached: "x" }, ports: { item: { kind: "one", fields: ["title"] } }, access: [], signals: [] },
};
const backend = { urls: { production: "https://api.example.test", local: null }, options: {} as Record<string, never> };
const contents = { name: "App", links: [] };
const settings = { app: { slug: "app", scheme: "app" } };
const home = ( ...children: Tree ) => screen({ contents: { name: "home", path: "/", title: t("nav.home") }, options: { presentation: "tab", order: 1 }, blocks: [block({}, children)] });

function compile ( schema: unknown, contracts: unknown = backend, manifests: Features = features ) {

    return validateSpec("app", { contents, settings, contracts }, schema, messages, manifests, catalogue);

}
function issues ( schema: unknown, contracts: unknown = backend, manifests: Features = features ): string {

    try { compile(schema, contracts, manifests); }
    catch ( error ) { return error instanceof Error ? error.message : String(error); }

    return "";

}
describe("screens", () => {

    test("tab screens are ordered into the tab list", () => {

        const second = { contents: { name: "more", path: "/more", title: t("nav.home") }, options: { presentation: "tab", order: 0 }, blocks: [] };
        const { schema } = compile({ screens: [home(feature("hero", { heading: true })), second] });

        expect(schema.tabs).toEqual(["more", "home"]);

    });
    test("a tab screen has no path parameters and a gated screen names its redirect", () => {

        const tab = { contents: { name: "item", path: "/items/:id", title: t("nav.home") }, options: { presentation: "tab" }, blocks: [] };
        const gated = { contents: { name: "account", path: "/account", title: t("nav.home") }, access: "user", blocks: [] };

        expect(issues({ screens: [home(feature("hero", { heading: true })), tab] })).toContain("no path parameters");
        expect(issues({ screens: [home(feature("hero", { heading: true })), gated] })).toContain("names its redirect");

    });
    test("every mobile feature is client-owned", () => {

        const server: Features = { ...features, hero: { ...features.hero, owner: "server" } as Features[string] };

        expect(issues({ screens: [home(feature("hero", { heading: true }))] }, backend, server)).toContain("client-owned");

    });
    test("ports bind like the web: reads need a backend, writes need an operation that writes", () => {

        expect(issues({ screens: [home(feature("hero", { heading: true }), feature("cards", { ports: { items: read("products.list") } }))] }, null)).toContain("declares none");
        expect(issues({ screens: [home(feature("hero", { heading: true }), feature("editor", { options: { errors: t("nav") }, ports: { save: write("products.list") } }))] })).toContain("is a read, not a write");

        const { schema } = compile({ screens: [home(feature("hero", { heading: true }), feature("editor", { options: { errors: t("nav") }, ports: { save: write("products.save") } }))] });

        expect(schema.screens[0]?.blocks[0]?.features[1]?.access).toEqual(["user"]);

    });
    test("reserved router paths are refused", () => {

        const bad = { contents: { name: "layout", path: "/_layout", title: t("nav.home") }, blocks: [] };

        expect(issues({ screens: [home(feature("hero", { heading: true })), bad] })).toContain("Reserved screen path");

    });

    test("a selectable table feeds a waiting detail on the same screen, and nothing else may", () => {

        const pair = home(feature("table", { heading: true, options: { select: true }, ports: { rows: read("products.list") } }), feature("detail", { ports: { item: read("products.view", { id: signal("selected", { wait: true }) }) } }));
        const { schema } = compile({ screens: [pair] });

        expect(schema.screens[0]?.blocks[0]?.features[1]?.ports.item).toEqual({ kind: "read", feature: "products", operation: "view", input: { id: { signal: "selected", wait: true } }, many: false });
        expect(issues({ screens: [home(feature("detail", { heading: true, ports: { item: read("products.view", { id: signal("selected", { wait: true }) }) } }))] })).toContain("emits");

    });

});
