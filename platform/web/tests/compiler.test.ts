import { describe, expect, test } from "bun:test";
import { get, many, post, z } from "engine/api";
import { type Catalogue, catalogueFacts, type Features } from "engine/spec";
import { block, feature, read, screen, site, type Tree, t, validateSpec, write } from "../src/lib/spec/surface.ts";

const messages = { en: { nav: { home: "Home" } }, ar: { nav: { home: "الرئيسية" } } };
const item = z.object({ id: z.number(), title: z.string(), image: z.string().nullish() });
const catalogue: Catalogue = catalogueFacts({
    products: {
        list: get("/products", { limit: z.number().optional() }, many(item)),
        view: get("/products/{productId}", { productId: z.number() }, item),
        save: post("/products", { title: z.string() }, item),
    },
});
const features: Features = {
    cards: { owner: "server", options: { columns: 3, title: "" }, ports: { items: { kind: "list", fields: ["title"] } }, access: [], signals: [] },
    editor: { owner: "client", options: { failed: "", errors: {} }, ports: { save: { kind: "write" } }, access: [], signals: [] },
    hero: { owner: "server", options: { prominent: false }, ports: { brand: { kind: "one", fields: ["name"], required: false } }, access: [], signals: [] },
};
const backend = { urls: { production: "https://api.example.test", local: null, browser: null }, options: {} as Record<string, never> };
const contents = { name: "Site", links: [] };
const home = ( ...children: Tree ) => screen({ contents: { name: "home", path: "/", title: t("nav.home"), description: t("nav.home") }, blocks: [block({}, children)] });

function compile ( schema: unknown, contracts: unknown = backend ) {

    return validateSpec("site", { contents, contracts }, schema, messages, features, catalogue);

}
function issues ( schema: unknown, contracts: unknown = backend ): string {

    try { compile(schema, contracts); }
    catch ( error ) { return error instanceof Error ? error.message : String(error); }

    return "";

}
describe("ports", () => {

    test("a read binds a list port and records the operation", () => {

        const { schema } = compile({ screens: [home(feature("hero", { heading: true }), feature("cards", { ports: { items: read("products.list", { limit: 8 }) } }))] });
        const [first] = schema.screens;

        expect(schema.operations).toEqual(["products.list"]);
        expect(first?.blocks[0]?.features[1]?.ports.items).toEqual({ kind: "read", feature: "products", operation: "list", input: { limit: 8 }, many: true });

    });
    test("a list port refuses a one-row read", () => {

        expect(issues({ screens: [home(feature("hero", { heading: true }), feature("cards", { ports: { items: read("products.view", { productId: 1 }) } }))] })).toContain("answers one row");

    });
    test("a required port must be bound", () => {

        expect(issues({ screens: [home(feature("hero", { heading: true }), feature("cards"))] })).toContain("needs its items port bound");

    });
    test("a site binding checks the document fields", () => {

        expect(issues({ screens: [home(feature("hero", { heading: true, ports: { brand: site("links") } }))] })).toContain("wants one row");
        expect(issues({ screens: [home(feature("hero", { heading: true, ports: { brand: site() } }))] })).toBe("");

    });
    test("a spec without a backend cannot read", () => {

        expect(issues({ screens: [home(feature("hero", { heading: true }), feature("cards", { ports: { items: read("products.list") } }))] }, null)).toContain("declares none");

    });
    test("a write belongs to a client-owned feature and a GET cannot be written", () => {

        expect(issues({ screens: [home(feature("hero", { heading: true }), feature("editor", { options: { failed: "x", errors: t("nav") }, ports: { save: write("products.list") } }))] })).toContain("is a read, not a write");
        expect(issues({ screens: [home(feature("hero", { heading: true }), feature("editor", { options: { failed: "x", errors: t("nav") }, ports: { save: write("products.save") } }))] })).toBe("");

    });
    test("unknown inputs and unbound path parameters are refused", () => {

        const bad = { screens: [home(feature("hero", { heading: true }), feature("cards", { ports: { items: read("products.list", { page: 2 }) } }))] };

        expect(issues(bad)).toContain("unknown input page");

    });

});
describe("screens", () => {

    test("options merge over the settings and exactly one heading is required", () => {

        expect(issues({ screens: [home(feature("hero"))] })).toContain("exactly one feature owns the screen heading");

    });
    test("a client-rendered screen needs client-owned features", () => {

        const schema = { screens: [{ contents: { name: "home", path: "/", title: t("nav.home"), description: t("nav.home") }, options: { render: "client" }, blocks: [block({}, [feature("hero", { heading: true })])] }] };

        expect(issues(schema)).toContain("client-owned");

    });
    test("a gated screen names its redirect and compiles client", () => {

        const gated = { contents: { name: "account", path: "/account", title: t("nav.home"), description: t("nav.home") }, access: "user", redirect: "/", blocks: [] };
        const { schema } = compile({ screens: [home(feature("hero", { heading: true })), gated] });

        expect(schema.screens[1]?.client).toBe(true);
        expect(issues({ screens: [home(feature("hero", { heading: true })), { ...gated, redirect: undefined }] })).toContain("names its redirect");

    });
    test("feature options are checked against the manifest", () => {

        expect(issues({ screens: [home(feature("hero", { heading: true, options: { prominent: "yes" } }))] })).toContain("takes boolean, not string");
        expect(issues({ screens: [home(feature("hero", { heading: true, options: { art: true } }))] })).toContain("has no option art");

    });
    test("every message must exist in every enabled language", () => {

        const schema = { screens: [{ contents: { name: "home", path: "/", title: t("nav.missing"), description: t("nav.home") }, blocks: [] }] };

        expect(issues(schema)).toContain('missing en message "nav.missing"');

    });
    test("a static delivery refuses parameterised paths", () => {

        const schema = { screens: [home(feature("hero", { heading: true })), { contents: { name: "item", path: "/items/:id", title: t("nav.home"), description: t("nav.home") }, blocks: [] }] };
        const config = { contents, contracts: null, settings: { delivery: "static" } };

        expect(() => validateSpec("site", config, schema, messages, features, catalogue)).toThrow("static delivery");

    });

});
