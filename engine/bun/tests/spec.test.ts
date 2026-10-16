import { describe, expect, test } from "bun:test";
import { get, many, post } from "engine/api";
import {
    catalogueFacts,
    compileBlock,
    createWalk,
    data,
    type Features,
    feature,
    read,
    type SiteFeature,
    site,
    write,
} from "engine/spec";
import { z } from "engine/validate";

type Block = { gap: number };

const item = z.object({ id: z.number(), title: z.string() });
const catalogue = catalogueFacts({
    products: {
        list: get("/products", { limit: z.number().optional() }, many(item)),
        view: get("/products/{productId}", { productId: z.number() }, item),
        save: post("/products", { title: z.string() }, item),
    },
});
const features: Features = {
    cards: {
        owner: "server",
        options: { columns: 3 },
        ports: { items: { kind: "list", fields: ["title"] } },
        access: [],
        signals: [],
    },
    editor: { owner: "client", options: {}, ports: { save: { kind: "write" } }, access: [], signals: [] },
    hero: {
        owner: "server",
        options: {},
        ports: { brand: { kind: "one", fields: ["name"], required: false } },
        access: [],
        signals: [],
    },
};

function compile ( children: SiteFeature<Block>[], backend = true, params: string[] = [] ) {

    const walk = createWalk<Block>({
        params,
        client: false,
        session: false,
        backend,
        block: { gap: 4 },
        site: { name: "Site", links: [] },
        features,
        catalogue,
    });
    const block = compileBlock<Block>({ features: children }, walk, "home.blocks[0]");

    return { block, issues: walk.issues.join("\n"), operations: [...walk.operations] };

}
describe("ports", () => {

    test("a read binds a list port and records the operation", () => {

        const { block, issues, operations } = compile([
            feature("cards", { ports: { items: read("products.list", { limit: 8 }) } }),
        ]);

        expect(issues).toBe("");
        expect(operations).toEqual(["products.list"]);
        expect(block.features[0]?.ports.items).toEqual({
            kind: "read",
            feature: "products",
            operation: "list",
            input: { limit: 8 },
            many: true,
        });

    });
    test("a list port refuses a one-row read and a required port must be bound", () => {

        expect(
            compile([feature("cards", { ports: { items: read("products.view", { productId: 1 }) } })]).issues,
        ).toContain("answers one row");
        expect(compile([feature("cards")]).issues).toContain("needs its items port bound");

    });
    test("data and site bindings check their shape and fields", () => {

        expect(compile([feature("cards", { ports: { items: data([{ title: "a" }]) } })]).issues).toBe("");
        expect(compile([feature("cards", { ports: { items: data([{ name: "a" }]) } })]).issues).toContain(
            "lacks title",
        );
        expect(compile([feature("hero", { ports: { brand: site("links") } })]).issues).toContain("wants one row");
        expect(compile([feature("hero", { ports: { brand: site() } })]).issues).toBe("");

    });
    test("a spec without a backend cannot read, and a write needs a client owner", () => {

        expect(compile([feature("cards", { ports: { items: read("products.list") } })], false).issues).toContain(
            "declares none",
        );
        expect(compile([feature("editor", { ports: { save: write("products.list") } })]).issues).toContain(
            "is a read, not a write",
        );
        expect(compile([feature("editor", { ports: { save: write("products.save") } })]).issues).toBe("");

    });
    test("unknown inputs and unbound path parameters are refused", () => {

        expect(compile([feature("cards", { ports: { items: read("products.list", { page: 2 }) } })]).issues).toContain(
            "unknown input page",
        );
        expect(compile([feature("hero", { ports: { brand: read("products.view") } })]).issues).toContain(
            "{productId} is not bound",
        );

    });
    test("options are checked by kind and merged over the manifest", () => {

        expect(
            compile([feature("cards", { options: { columns: "3" }, ports: { items: data([{ title: "a" }]) } })]).issues,
        ).toContain("takes number, not string");
        expect(
            compile([feature("cards", { options: { rows: 1 }, ports: { items: data([{ title: "a" }]) } })]).issues,
        ).toContain("has no option rows");

    });

});
