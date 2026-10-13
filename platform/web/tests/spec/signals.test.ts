import { describe, expect, test } from "bun:test";
import { get, many, z } from "@engine/api";
import { type Catalogue, catalogueFacts, type Features } from "@engine/spec";
import { block, feature, live, read, screen, signal, type Tree, t, validateSpec } from "../../src/lib/spec/surface.ts";

const messages = { en: { nav: { home: "Home" } }, ar: { nav: { home: "الرئيسية" } } };
const item = z.object({ id: z.number(), title: z.string(), updated_at: z.string() });
const catalogue: Catalogue = catalogueFacts({
    products: {
        list: get("/products", { limit: z.number().optional(), search: z.string().optional() }, many(item)),
        view: get("/products/{id}", { id: z.number() }, item),
    },
});
const states = { loading: "x", failed: "x", offline: "x", cached: "x" };
const features: Features = {
    table: { owner: "client", options: { select: false, ...states, empty: "x" }, ports: { rows: { kind: "list", fields: ["title"] } }, access: [], signals: ["selected"] },
    preview: { owner: "client", options: { ...states }, ports: { item: { kind: "one", fields: ["title"] } }, access: [], signals: [] },
};
const backend = { urls: { production: "https://api.example.test", local: null, browser: null }, options: { insecure: true }, realtime: { url: "ws://127.0.0.1:8080", key: "k" } };
const contents = { name: "Site", links: [] };
const panel = ( ...children: Tree ) => screen({ contents: { name: "home", path: "/", title: t("nav.home"), description: t("nav.home") }, options: { render: "client" }, blocks: [block({}, children)] });

function compile ( schema: unknown ) {

    return validateSpec("site", { contents, contracts: backend }, schema, messages, features, catalogue);

}
function issues ( schema: unknown ): string {

    try { compile(schema); }
    catch ( error ) { return error instanceof Error ? error.message : String(error); }

    return "";

}
describe("features talk through signals", () => {

    test("a waiting input keeps the port idle until the emitting feature speaks", () => {

        const { schema } = compile({ screens: [panel(
            feature("table", { heading: true, options: { select: true }, ports: { rows: read("products.list", { limit: 20 }) } }),
            feature("preview", { ports: { item: read("products.view", { id: signal("selected", { wait: true }) }) } }),
        )] });
        const [first] = schema.screens;

        expect(first?.blocks[0]?.features[1]?.ports.item).toEqual({ kind: "read", feature: "products", operation: "view", input: { id: { signal: "selected", wait: true } }, many: false });

    });
    test("a consumed signal needs an emitter on the same screen", () => {

        expect(issues({ screens: [panel(feature("preview", { heading: true, ports: { item: read("products.view", { id: signal("selected", { wait: true }) }) } }))] })).toContain("emits");

    });
    test("a live port carries its patch rule so a payload can update the shown rows", () => {

        const { schema } = compile({ screens: [panel(
            feature("table", { heading: true, ports: { rows: read("products.list", { limit: 20 }, live("products", ["product.saved"], { path: "product", version: "updated_at" })) } }),
        )] });
        const port = schema.screens[0]?.blocks[0]?.features[0]?.ports.rows;

        expect(port?.kind === "read" ? port.live : undefined).toEqual({ channel: "products", events: ["product.saved"], patch: { path: "product", key: "id", version: "updated_at" } });

    });

    test("a patch key or version the operation does not answer is refused at compile time", () => {

        const bad = ( patch: { path: string; key?: string; version?: string } ) => issues({ screens: [panel(
            feature("table", { heading: true, ports: { rows: read("products.list", { limit: 20 }, live("products", ["product.saved"], patch)) } }),
        )] });

        expect(bad({ path: "product", version: "modified_at" })).toContain("lacks modified_at");
        expect(bad({ path: "product", key: "uuid" })).toContain("lacks uuid");
        expect(bad({ path: "product", version: "updated_at" })).toBe("");

    });

});
