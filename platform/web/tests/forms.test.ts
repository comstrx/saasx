import { describe, expect, test } from "bun:test";
import { del, get, feature as group, many, need, post } from "engine/api";
import { type Catalogue, catalogueFacts, type Features } from "engine/spec";
import { z } from "engine/validate";
import { block, feature, param, read, screen, type Tree, t, validateSpec, write } from "../src/lib/spec/surface.ts";

const state = { loading: "Loading", failed: "Failed", offline: "Offline", cached: "Saved", empty: "Empty" };
const errors = { failed: "Failed" };
const messages = {
    en: { nav: { home: "Home" }, state, errors, item: { fields: { title: "Title", stock: "Stock" } } },
    ar: { nav: { home: "الرئيسية" }, state, errors, item: { fields: { title: "العنوان", stock: "المخزون" } } },
};
const item = z.object({ id: z.number(), title: z.string(), stock: z.number().nullish() });
const catalogue: Catalogue = catalogueFacts({
    products: group({ touches: ["products"] }, {
        list: get("/products", { limit: z.number().optional() }, many(item)),
        view: get("/products/{id}", { id: z.coerce.number() }, item),
        save: post("/products", {
            title: z.string().min(2),
            stock: z.coerce.number().int().min(0).optional(),
            kind: z.enum(["a", "b"]),
        }, item),
        update: post("/products/{id}", { id: z.coerce.number(), title: z.string().min(2) }, item),
        remove: need(["delete_products"], del("/products/{id}", { id: z.coerce.number() }, z.unknown())),
    }),
});
const states = { loading: "x", failed: "x", offline: "x", cached: "x" };
const features: Features = {
    form: {
        owner: "client",
        options: { ...states, labels: {}, choices: {}, errors: {} },
        ports: { item: { kind: "one", required: false }, save: { kind: "write" } },
        access: [],
        signals: [],
    },
    cards: { owner: "client", options: { ...states, empty: "x" }, ports: { items: { kind: "list" } }, access: [], signals: [] },
};
const backend = { urls: { production: "https://api.example.test", local: null, browser: null }, options: {} as Record<string, never> };
const contents = { name: "Site", links: [] };
const page = ( path: string, ...children: Tree ) => screen({
    contents: { name: path === "/" ? "home" : "edit", path, title: t("nav.home"), description: t("nav.home"), icon: "pencil" },
    options: { render: "client" },
    blocks: [block({}, children)],
});

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

        const save = write("products.save", {}, ["kind", "title", "stock"]);
        const form = feature("form", { heading: true, options: { errors: t("item"), labels: t("item.fields") }, ports: { save } });
        const { schema } = compile({ screens: [page("/", form)] });
        const port = schema.screens[0]?.blocks[0]?.features[0]?.ports.save;
        const fields = port?.kind === "write" ? port.fields.map(( field ) => [field.name, field.kind, field.required]) : [];

        expect(fields).toEqual([["kind", "choice", true], ["title", "text", true], ["stock", "integer", false]]);
        expect(port?.kind === "write" ? port.touches : []).toEqual(["products"]);

    });
    test("an edit form binds the route parameter and edits only what is left unbound", () => {

        const cards = feature("cards", { heading: true, ports: { items: read("products.list") } });
        const ports = { item: read("products.view", { id: param("id") }), save: write("products.update", { id: param("id") }) };
        const form = feature("form", { heading: true, options: { errors: t("item") }, ports });
        const { schema } = compile({ screens: [page("/", cards), page("/items/:id/edit", form)] });
        const port = schema.screens[1]?.blocks[0]?.features[0]?.ports.save;

        expect(port?.kind === "write" ? port.fields.map(( field ) => field.name) : []).toEqual(["title"]);

    });
    test("a field the operation does not take, an unknown icon and an empty state text are refused", () => {

        const options = { errors: t("item") };
        const priced = feature("form", { heading: true, options, ports: { save: write("products.save", {}, ["price"]) } });
        const plain = page("/", feature("form", { heading: true, options, ports: { save: write("products.save") } }));
        const sparkle = { name: "home", path: "/", title: t("nav.home"), description: t("nav.home"), icon: "sparkle" };
        const silent = feature("cards", { heading: true, options: { empty: "" }, ports: { items: read("products.list") } });

        expect(issues({ screens: [page("/", priced)] })).toContain("takes no price");
        expect(issues({ screens: [{ ...plain, contents: sparkle }] })).toContain("no icon named sparkle");
        expect(issues({ screens: [page("/", silent)] })).toContain("leaves its empty text empty");

    });
    test("a message branch fills an object option when the tree localizes", async () => {

        const { localizeTree } = await import("engine/translate");
        const options = { errors: t("item"), labels: t("item.fields") };
        const save = write("products.save");
        const { schema } = compile({ screens: [page("/", feature("form", { heading: true, options, ports: { save } }))] });
        const compiled = schema.screens[0]?.blocks[0]?.features[0]?.options;
        const localized = localizeTree(compiled, messages.ar, "ar") as { labels: Record<string, string> };

        expect(localized.labels).toEqual({ title: "العنوان", stock: "المخزون" });

    });

});
describe("permissions", () => {

    test("a write port names what the session must hold; the feature itself is gated only by its reads", () => {

        const pane: Features = {
            ...features,
            pane: {
                owner: "client",
                options: { ...states, errors: {} },
                ports: { item: { kind: "one" }, remove: { kind: "write", required: false } },
                access: [],
                signals: [],
            },
        };
        const ports = { item: read("products.view", { id: 1 }), remove: write("products.remove", { id: 1 }) };
        const spec = { screens: [page("/", feature("pane", { heading: true, options: { errors: t("item") }, ports }))] };
        const { schema } = validateSpec("site", { contents, contracts: backend }, spec, messages, pane, catalogue);
        const compiled = schema.screens[0]?.blocks[0]?.features[0];

        expect(compiled?.access).toEqual([]);
        expect(compiled?.ports.remove).toMatchObject({ permissions: ["delete_products"] });

    });

});
