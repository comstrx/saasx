import { describe, expect, test } from "bun:test";
import { del, get, feature as group, many, need, post, z } from "@engine/api";
import { type Catalogue, catalogueFacts, type Features } from "@engine/spec";
import { block, feature, param, read, screen, type Tree, t, validateSpec, write } from "../../src/lib/spec/surface.ts";

const messages = { en: { nav: { home: "Home" }, item: { fields: { title: "Title", stock: "Stock" } } }, ar: { nav: { home: "الرئيسية" }, item: { fields: { title: "العنوان", stock: "المخزون" } } } };
const item = z.object({ id: z.number(), title: z.string(), stock: z.number().nullish() });
const catalogue: Catalogue = catalogueFacts({
    products: group({ touches: ["products"] }, {
        list: get("/products", { limit: z.number().optional() }, many(item)),
        view: get("/products/{id}", { id: z.coerce.number() }, item),
        save: post("/products", { title: z.string().min(2), stock: z.coerce.number().int().min(0).optional(), kind: z.enum(["a", "b"]) }, item),
        update: post("/products/{id}", { id: z.coerce.number(), title: z.string().min(2) }, item),
        remove: need(["delete_products"], del("/products/{id}", { id: z.coerce.number() }, z.unknown())),
    }),
});
const states = { loading: "x", failed: "x", offline: "x", cached: "x" };
const features: Features = {
    form: { owner: "client", options: { ...states, labels: {}, choices: {}, errors: {} }, ports: { item: { kind: "one", required: false }, save: { kind: "write" } }, access: [], signals: [] },
    cards: { owner: "client", options: { ...states, empty: "x" }, ports: { items: { kind: "list" } }, access: [], signals: [] },
};
const backend = { urls: { production: "https://api.example.test", local: null, browser: null }, options: {} as Record<string, never> };
const contents = { name: "Site", links: [] };
const page = ( path: string, ...children: Tree ) => screen({ contents: { name: path === "/" ? "home" : "edit", path, title: t("nav.home"), description: t("nav.home"), icon: "pencil" }, options: { render: "client" }, blocks: [block({}, children)] });

function compile ( schema: unknown ) {

    return validateSpec("site", { contents, contracts: backend }, schema, messages, features, catalogue);

}
function issues ( schema: unknown ): string {

    try { compile(schema); }
    catch ( error ) { return error instanceof Error ? error.message : String(error); }

    return "";

}
describe("forms from the catalogue", () => {

    test("a create form carries the facts of the fields it edits, in the order the spec names them", () => {

        const { schema } = compile({ screens: [page("/", feature("form", { heading: true, options: { errors: t("item"),  labels: t("item.fields") }, ports: { save: write("products.save", {}, ["kind", "title", "stock"]) } }))] });
        const port = schema.screens[0]?.blocks[0]?.features[0]?.ports.save;

        expect(port?.kind === "write" ? port.fields.map(( field ) => [field.name, field.kind, field.required]) : []).toEqual([["kind", "choice", true], ["title", "text", true], ["stock", "integer", false]]);
        expect(port?.kind === "write" ? port.touches : []).toEqual(["products"]);

    });
    test("an edit form binds the route parameter and edits only what is left unbound", () => {

        const { schema } = compile({ screens: [page("/", feature("cards", { heading: true, ports: { items: read("products.list") } })), page("/items/:id/edit", feature("form", { heading: true, options: { errors: t("item") }, ports: { item: read("products.view", { id: param("id") }), save: write("products.update", { id: param("id") }) } }))] });
        const port = schema.screens[1]?.blocks[0]?.features[0]?.ports.save;

        expect(port?.kind === "write" ? port.fields.map(( field ) => field.name) : []).toEqual(["title"]);

    });
    test("a field the operation does not take, an unknown icon and an empty state text are refused", () => {

        expect(issues({ screens: [page("/", feature("form", { heading: true, options: { errors: t("item") }, ports: { save: write("products.save", {}, ["price"]) } }))] })).toContain("takes no price");
        expect(issues({ screens: [{ ...page("/", feature("form", { heading: true, options: { errors: t("item") }, ports: { save: write("products.save") } })), contents: { name: "home", path: "/", title: t("nav.home"), description: t("nav.home"), icon: "sparkle" } }] })).toContain("no icon named sparkle");
        expect(issues({ screens: [page("/", feature("cards", { heading: true, options: { empty: "" }, ports: { items: read("products.list") } }))] })).toContain("leaves its empty text empty");

    });
    test("a message branch fills an object option when the tree localizes", async () => {

        const { localizeTree } = await import("@engine/spec");
        const { schema } = compile({ screens: [page("/", feature("form", { heading: true, options: { errors: t("item"),  labels: t("item.fields") }, ports: { save: write("products.save") } }))] });
        const localized = localizeTree(schema.screens[0]?.blocks[0]?.features[0]?.options, messages.ar, "ar") as { labels: Record<string, string> };

        expect(localized.labels).toEqual({ title: "العنوان", stock: "المخزون" });

    });

});
describe("permissions", () => {

    test("a write port names what the session must hold; the feature itself is gated only by its reads", () => {

        const pane: Features = { ...features, pane: { owner: "client", options: { ...states, errors: {} }, ports: { item: { kind: "one" }, remove: { kind: "write", required: false } }, access: [], signals: [] } };
        const { schema } = validateSpec("site", { contents, contracts: backend }, { screens: [page("/", feature("pane", { heading: true, options: { errors: t("item") }, ports: { item: read("products.view", { id: 1 }), remove: write("products.remove", { id: 1 }) } }))] }, messages, pane, catalogue);
        const compiled = schema.screens[0]?.blocks[0]?.features[0];

        expect(compiled?.access).toEqual([]);
        expect(compiled?.ports.remove).toMatchObject({ permissions: ["delete_products"] });

    });

});
