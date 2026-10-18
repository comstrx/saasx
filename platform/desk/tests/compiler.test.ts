import { describe, expect, test } from "bun:test";
import { get, many, post } from "engine/api";
import { type Catalogue, catalogueFacts, type Features } from "engine/spec";
import { z } from "engine/validate";
import { block, feature, read, screen, type Tree, t, validateSpec, write } from "../src/lib/spec/surface.ts";

const state = { loading: "Loading", failed: "Failed", offline: "Offline", cached: "Saved", empty: "Empty" };
const errors = { failed: "Failed" };
const messages = { en: { nav: { home: "Home" }, state, errors }, ar: { nav: { home: "الرئيسية" }, state, errors } };
const item = z.object({ id: z.number(), title: z.string() });
const catalogue: Catalogue = catalogueFacts({
    products: {
        list: get("/products", { limit: z.number().optional() }, many(item)),
        save: post("/products", { title: z.string() }, item),
    },
});
const features: Features = {
    cards: {
        owner: "client",
        options: { columns: 2, loading: "x", failed: "x", offline: "x", cached: "x", empty: "x" },
        ports: { items: { kind: "list", fields: ["title"] } },
        access: [],
        signals: [],
    },
    hero: { owner: "client", options: {}, ports: {}, access: [], signals: [] },
    editor: { owner: "client", options: { failed: "x", errors: {} }, ports: { save: { kind: "write" } }, access: ["user"], signals: [] },
};
const backend = { urls: { production: "https://api.example.test", local: null }, options: {} as Record<string, never> };
const contents = { name: "App", links: [] };
const settings = { app: { slug: "app", identifier: "app.desk.test" } };
const home = ( ...children: Tree ) => screen({
    contents: { name: "home", path: "/", title: t("nav.home") },
    blocks: [block({}, children)],
});
const hero = () => feature("hero", { heading: true });

function compile ( schema: unknown, contracts: unknown = backend, manifests: Features = features, chosen: unknown = settings ) {

    return validateSpec("app", { contents, settings: chosen, contracts }, schema, messages, manifests, catalogue);

}
function issues ( schema: unknown, contracts: unknown = backend, manifests: Features = features, chosen: unknown = settings ): string {

    try { compile(schema, contracts, manifests, chosen); }
    catch ( error ) { return error instanceof Error ? error.message : String(error); }

    return "";

}
describe("desk specs", () => {

    test("the window and the permissions have safe defaults an app can narrow or widen", () => {

        const { config } = compile({ screens: [home(hero())] });

        expect(config.settings.window).toEqual({ width: 1280, height: 800, minWidth: 720, minHeight: 480, resizable: true, decorations: true });
        expect(config.settings.permissions).toEqual([]);
        expect(config.settings.app.identifier).toBe("app.desk.test");

    });
    test("an identifier is reverse-domain and a permission is a tauri identifier", () => {

        const bad = { app: { slug: "app", identifier: "app" } };
        const loud = { app: { slug: "app", identifier: "app.desk.test" }, permissions: ["Core Default"] };

        expect(issues({ screens: [home(hero())] }, backend, features, bad)).toContain("identifier");
        expect(issues({ screens: [home(hero())] }, backend, features, loud)).toContain("permissions");

    });
    test("every desk feature is client-owned and a gated screen names its redirect", () => {

        const server: Features = { ...features, hero: { ...features.hero, owner: "server" } as Features[string] };
        const gated = { contents: { name: "account", path: "/account", title: t("nav.home") }, access: "user", blocks: [] };

        expect(issues({ screens: [home(hero())] }, backend, server)).toContain("client-owned");
        expect(issues({ screens: [home(hero()), gated] })).toContain("names its redirect");

    });
    test("ports bind like the web: reads need a backend, writes need an operation that writes", () => {

        const cards = feature("cards", { ports: { items: read("products.list") } });
        const editor = ( operation: string ) => feature("editor", { options: { errors: t("nav") }, ports: { save: write(operation) } });

        expect(issues({ screens: [home(hero(), cards)] }, null)).toContain("declares none");
        expect(issues({ screens: [home(hero(), editor("products.list"))] })).toContain("is a read, not a write");

        const { schema } = compile({ screens: [home(hero(), editor("products.save"))] });

        expect(schema.screens[0]?.blocks[0]?.features[1]?.access).toEqual(["user"]);

    });
    test("reserved router paths are refused", () => {

        const bad = { contents: { name: "layout", path: "/_layout", title: t("nav.home") }, blocks: [] };

        expect(issues({ screens: [home(hero()), bad] })).toContain("Reserved screen path");

    });

});
