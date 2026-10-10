import assert from "node:assert/strict";
import { test } from "node:test";
import { channelDefaults } from "../../src/api/core/config.ts";
import { resourceDefaults } from "../../src/api/core/resource.ts";
import { contentBlocks, contentShape, settingsShape, themeShape } from "../../src/lib/spec/contract.ts";
import { settingsDefaults, themeDefaults } from "../../src/lib/spec/defaults.ts";
import { validateSpec } from "../../src/lib/spec/validate.ts";
import { same } from "../core/assert.ts";
import { coreApi } from "../core/backend.ts";
import { dictionaries, minimal } from "../core/project.ts";

const features = {
    hero: {
        client: false,
        options: { columns: 3, badge: true, label: null, title: "", tags: ["a"], card: { radius: "md", shadow: "sm" } },
    },
    cart: { client: true, options: {} },
    orders: { client: false, options: {} },
    navbar: { client: false, options: { links: ["home"] } },
};

function screen ( name: string, path: string, contents: Record<string, unknown> = {}, extra: Record<string, unknown> = {} ) {

    return { contents: { name, path, title: "t", description: "d", ...contents }, blocks: [], ...extra };

}
function issues ( rawConfig: unknown, rawSchema: unknown ): string[] {

    try {

        validateSpec(rawConfig, rawSchema, dictionaries, features);

    }
    catch ( error ) {

        return error instanceof Error ? error.message.split("\n") : [String(error)];

    }

    return [];

}
test("the smallest possible spec compiles to exactly the core defaults", () => {

    const { config, schema } = validateSpec(minimal, { screens: [] }, dictionaries);

    assert.deepEqual(config.settings, settingsShape.parse(settingsDefaults));
    assert.deepEqual(config.theme, themeShape.parse(themeDefaults));
    assert.deepEqual(config.content, contentShape.parse({}));
    assert.deepEqual(config.contract.values.content, resourceDefaults("content"));
    assert.deepEqual(config.contract.values.settings.languages, config.settings.locale.enabled);
    same(config.contract.features, coreApi().contract.features, "compiled contract features");
    assert.equal(config.api.context.currency, config.settings.currency.default);
    assert.deepEqual(schema, { screens: [], features: [], shell: { nav: {}, footer: {}, sidebar: {}, loader: {} } });

});
test("preference defaults must be enabled and enabled lists must be unique", () => {

    const broken = {
        ...minimal,
        settings: {
            locale: { default: "ar", enabled: ["en", "en"], timeZone: "UTC" },
            currency: { default: "EUR", enabled: ["USD"] },
        },
    };

    assert.deepEqual(issues(broken, { screens: [] }), [
        "settings.locale.enabled contains duplicates.",
        "settings.locale.default must be enabled.",
        "settings.currency.default must be enabled.",
    ]);

});
test("screens are unique, unreserved, chronologically sane, rooted at / and fully translated", () => {

    const screens = [
        screen("a", "/x"),
        screen("a", "/x"),
        screen("b", "/api/q"),
        screen("c", "/y", { article: { publishedAt: "2026-01-02T00:00:00Z", modifiedAt: "2026-01-01T00:00:00Z" } }),
        screen("d", "/z", { title: { key: "missing.key" } }),
        screen("e", "/ar/offers"),
        screen("f", "/stays/:stayId", { entity: "product" }),
    ];

    assert.deepEqual(issues(minimal, { screens }), [
        "Duplicate screen name: a",
        "Duplicate screen path: /x",
        "Reserved screen path: /api/q",
        "/y: modifiedAt precedes publishedAt.",
        "Reserved screen path: /ar/offers",
        "/stays/:stayId: the product screen needs :productId in its path.",
        "schema.screens must declare the home path /.",
        'schema.4.title: missing en message "missing.key".',
        'schema.4.title: missing ar message "missing.key".',
    ]);

});
test("features exist with their real options at any depth, under unique ids, one heading and client ownership", () => {

    const loud = { name: "hero", heading: true, options: { columns: 4, badge: "yes", tags: "b", label: 1, gap: 2, card: { radius: 3 } } };
    const deep = { name: "cart", heading: true, features: [{ name: "hero", options: { card: { radius: "xl", ghost: true } } }] };
    const home = screen("home", "/", {}, {
        options: { render: "client", footer: "copyright" },
        blocks: [
            { id: "top", features: [loud] },
            { options: { sizes: [2, 1] }, features: [{ id: "top", name: "cart" }, { name: "missing" }] },
            { blocks: [{ features: [deep] }] },
        ],
    });

    assert.deepEqual(issues(minimal, { screens: [home] }), [
        "home.blocks[0].features[0]: a client-rendered screen needs client-owned features; hero is server-owned.",
        "home.blocks[0].features[0]: option badge of hero takes boolean, not string.",
        "home.blocks[0].features[0]: option tags of hero takes array, not string.",
        "home.blocks[0].features[0]: feature hero has no option gap.",
        "home.blocks[0].features[0].card: option radius of hero takes string, not number.",
        "home.blocks[1].features[0]: duplicate id top.",
        "home.blocks[1].features[1]: no feature named missing under src/features.",
        "home.blocks[2].blocks[0].features[0].features[0]: a client-rendered screen needs client-owned features; hero is server-owned.",
        "home.blocks[2].blocks[0].features[0].features[0].card: feature hero has no option ghost.",
        "home: exactly one feature owns the screen heading.",
    ]);

    const gated = screen("orders", "/orders", {}, { blocks: [{ features: [{ name: "orders", heading: true }] }] });
    const nested = { name: "cart", heading: true, features: [{ name: "cart" }] };
    const client = screen("cart", "/", {}, { options: { render: "client" }, blocks: [{ features: [nested] }] });
    const [compiled] = validateSpec(minimal, { screens: [client] }, dictionaries, features).schema.screens;

    assert.deepEqual(issues(minimal, { screens: [gated] }), [
        "schema.screens must declare the home path /.",
        'orders.blocks[0].features[0]: orders needs permissions, so its entry must be client-owned ("use client").',
    ]);
    assert.equal(compiled?.blocks[0]?.features[0]?.features[0]?.id, "cart.blocks[0].features[0].features[0]");

});
test("a compiled screen flattens its contents and merges every option over its defaults, naming the features it uses", () => {

    const settings = {
        shell: { nav: "navbar", footer: null, sidebar: null, loader: null },
        screen: { footer: false },
        block: { gap: 4 },
    };
    const hero = { name: "hero", heading: true, options: { columns: 2, title: { key: "greeting" }, card: { radius: "xl" } } };
    const home = screen("home", "/", { icon: "house" }, {
        options: { seo: false, nav: true },
        blocks: [
            { id: "top", options: { grid: { base: 1, md: 2 }, tone: "surface" }, features: [hero] },
            { features: [{ name: "cart", blocks: [{ features: [{ name: "hero" }] }] }] },
        ],
    });
    const { config, schema } = validateSpec({ ...minimal, settings }, { screens: [home] }, dictionaries, features);
    const [compiled] = schema.screens;
    const ghost = { shell: { ...settings.shell, nav: "ghost" } };

    assert.deepEqual(config.settings.shell, settings.shell);
    assert.equal(compiled?.name, "home");
    assert.equal(compiled?.icon, "house");
    assert.deepEqual(compiled?.options, { ...settingsDefaults.screen, seo: false, index: false, nav: true, footer: false });
    assert.deepEqual(compiled?.blocks[0], {
        id: "top",
        options: { ...settingsDefaults.block, gap: 4, grid: { base: 1, md: 2 }, tone: "surface" },
        features: [{
            name: "hero",
            id: "home.blocks[0].features[0]",
            heading: true,
            options: {
                columns: 2, badge: true, label: null, title: { key: "greeting" }, tags: ["a"], card: { radius: "xl", shadow: "sm" },
            },
            features: [],
            blocks: [],
        }],
        blocks: [],
    });
    assert.deepEqual(compiled?.blocks[1]?.features[0]?.blocks[0]?.features[0]?.name, "hero");
    assert.deepEqual(compiled?.blocks[1]?.features[0]?.options, {});
    assert.deepEqual(compiled?.features, ["cart", "hero", "navbar"]);
    assert.deepEqual(schema.features, ["cart", "hero", "navbar"]);
    assert.deepEqual(schema.shell, { nav: { links: ["home"] }, footer: {}, sidebar: {}, loader: {} });
    assert.deepEqual(issues({ ...minimal, settings: ghost }, { screens: [] }), [
        "settings.shell.nav: no feature named ghost under src/features.",
    ]);

});
test("the content blocks cover the site document exactly once, and flatten into it", () => {

    const listed = Object.values(contentBlocks).flatMap(( block ) => Object.keys(block));

    assert.deepEqual([...listed].sort(), Object.keys(contentShape.shape).filter(( key ) => key !== "seo").sort());
    assert.equal(new Set(listed).size, listed.length);

    const contents = { infos: { name: "Blocks" }, urls: { map_url: "https://maps.example.test/x" }, address: { city: "Cairo" }, seo: { title: "T" } };
    const { config } = validateSpec({ ...minimal, contents }, { screens: [] }, dictionaries);

    assert.equal(config.content.name, "Blocks");
    assert.equal(config.content.map_url, "https://maps.example.test/x");
    assert.equal(config.content.city, "Cairo");
    assert.equal(config.content.tagline, "");
    assert.equal(config.content.seo.title, "T");
    assert.equal(config.content.seo.indexable, false);

});
test("one url per mode and one prefix address the API and its broadcast root", () => {

    const contracts = {
        urls: { production: "https://api.example.test", local: "http://localhost:8000", browser: "https://edge.example.test" },
        options: { spec: "client", prefix: "v1", timeoutMs: 3000, browser: true },
    } as const;
    const { config } = validateSpec({ ...minimal, contracts }, { screens: [] }, dictionaries);
    const rejects = ( changes: Record<string, unknown> ) => assert.throws(() => validateSpec({ ...minimal, contracts: { ...contracts, ...changes } }, { screens: [] }, dictionaries));

    assert.equal(config.api.connections.primary?.baseUrl, "https://api.example.test/v1");
    assert.equal(config.api.connections.primary?.browserBaseUrl, "https://edge.example.test/v1");
    assert.deepEqual(config.api.connections.primary?.development, { baseUrl: "http://localhost:8000/v1", browserBaseUrl: "https://edge.example.test/v1" });
    assert.equal(config.api.connections.primary?.timeoutMs, 3000);
    assert.equal(config.api.connections.broadcast?.baseUrl, "https://api.example.test");
    assert.deepEqual(config.api.connections.broadcast?.development, { baseUrl: "http://localhost:8000", browserBaseUrl: "https://edge.example.test" });
    assert.deepEqual(config.api.realtime, { transport: "pusher", channels: channelDefaults });
    assert.deepEqual(validateSpec({ ...minimal, contracts: { ...contracts, urls: { production: null, local: null } } }, { screens: [] }, dictionaries).config.api.connections.primary?.baseUrl, null);

    rejects({ urls: { production: "https://api.example.test/v1", local: null } });
    rejects({ urls: { production: "wss://api.example.test", local: null } });
    rejects({ options: { spec: "client", prefix: "/v1" } });
    rejects({ options: { spec: "client", tenant: "www.example.test" } });
    rejects({ endpoints: { auth: "broadcasting/auth" } });

});
test("the spec boundary rejects unknown keys, foreign asset paths, derived values and header injection", () => {

    const rejects = ( config: unknown, schema: unknown = { screens: [] } ) => assert.throws(() => validateSpec(config, schema, dictionaries));

    rejects({ ...minimal, surprise: true });
    rejects({ ...minimal, themes: { colors: { light: { brand: "#000000" } } } });
    rejects(minimal, { screens: [], extra: [] });
    rejects({ ...minimal, contents: { logos: { logo: "/assets/images/layout/x.png" } } });
    rejects({ ...minimal, contents: { urls: { url: "https://a.test/path" } } });
    rejects({ ...minimal, contents: { infos: { url: "https://a.test" } } });
    rejects({ ...minimal, contents: { name: "flat" } });
    rejects({ ...minimal, settings: { fonts: { en: "../x.ttf" } } });
    rejects({ ...minimal, settings: { mediaOrigins: ["https://cdn.test/path"] } });
    rejects({ ...minimal, contracts: { ...minimal.contracts, options: { ...minimal.contracts.options, currency: "USD" } } });
    rejects({ ...minimal, contracts: { ...minimal.contracts, api: { request: { headers: { tenant: "Host" } } } } });
    rejects({ ...minimal, contracts: { ...minimal.contracts, api: { request: { headers: { auth: { name: "Authorization", prefix: "Bearer\r\n" } } } } } });
    rejects({ ...minimal, contracts: { ...minimal.contracts, api: { request: { headers: { tenant: "X Tenant" } } } } });

});
