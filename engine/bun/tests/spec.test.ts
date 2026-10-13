import { describe, expect, test } from "bun:test";
import { get, many, post, feature as spec, z } from "@engine/api";
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
    stateIssues,
    write,
} from "@engine/spec";

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

function compile(children: SiteFeature<Block>[], backend = true, params: string[] = []) {
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
describe("forms and states", () => {
    const form: Features = {
        ...features,
        form: {
            owner: "client",
            options: { failed: "x" },
            ports: { save: { kind: "write" } },
            access: [],
            signals: [],
        },
    };
    const withForm = (children: SiteFeature<Block>[]) => {
        const walk = createWalk<Block>({
            params: [],
            client: false,
            session: false,
            backend: true,
            block: { gap: 4 },
            site: {},
            features: form,
            catalogue,
        });
        const block = compileBlock<Block>({ features: children }, walk, "home.blocks[0]");

        return { block, issues: walk.issues.join("\n") };
    };

    test("a write binding carries the facts of its editable fields, bound inputs excluded", () => {
        const all = withForm([feature("form", { ports: { save: write("products.save") } })]);
        const chosen = withForm([feature("form", { ports: { save: write("products.save", {}, ["title"]) } })]);
        const bound = withForm([feature("form", { ports: { save: write("products.save", { title: "fixed" }) } })]);

        expect(all.issues).toBe("");
        expect(all.block.features[0]?.ports.save).toEqual({
            kind: "write",
            feature: "products",
            operation: "save",
            input: {},
            fields: [{ name: "title", kind: "text", required: true, nullable: false }],
            touches: [],
        });
        expect(chosen.block.features[0]?.ports.save).toMatchObject({ fields: [{ name: "title" }] });
        expect(bound.block.features[0]?.ports.save).toMatchObject({ fields: [] });
    });
    test("a write port carries the features its operation touches", () => {
        const touching = catalogueFacts({
            products: spec({ touches: ["products"] }, { save: post("/products", { title: z.string() }, item) }),
        });
        const walk = createWalk<Block>({
            params: [],
            client: false,
            session: false,
            backend: true,
            block: { gap: 4 },
            site: {},
            features: form,
            catalogue: touching,
        });
        const block = compileBlock<Block>(
            { features: [feature("form", { ports: { save: write("products.save") } })] },
            walk,
            "home.blocks[0]",
        );

        expect(block.features[0]?.ports.save).toMatchObject({ touches: ["products"] });
    });
    test("an object option may name a message branch, resolved when the tree localizes", () => {
        const labelled: Features = {
            ...form,
            form: { ...(form.form as Features[string]), options: { failed: "x", labels: {} } },
        };
        const walk = createWalk<Block>({
            params: [],
            client: false,
            session: false,
            backend: true,
            block: { gap: 4 },
            site: {},
            features: labelled,
            catalogue,
        });

        compileBlock<Block>(
            {
                features: [
                    feature("form", {
                        options: { labels: { key: "catalog.fields" } },
                        ports: { save: write("products.save") },
                    }),
                ],
            },
            walk,
            "home.blocks[0]",
        );
        expect(walk.issues).toEqual([]);
    });
    test("inputs and fields are columns, so snake_case names pass", () => {
        const dated = catalogueFacts({
            products: { save: post("/products", { title: z.string(), starts_at: z.string().optional() }, item) },
        });
        const walk = createWalk<Block>({
            params: [],
            client: false,
            session: false,
            backend: true,
            block: { gap: 4 },
            site: {},
            features: form,
            catalogue: dated,
        });
        const block = compileBlock<Block>(
            {
                features: [
                    feature("form", {
                        ports: { save: write("products.save", { starts_at: "2026-01-01" }, ["title"]) },
                    }),
                ],
            },
            walk,
            "home.blocks[0]",
        );

        expect(walk.issues).toEqual([]);
        expect(block.features[0]?.ports.save).toMatchObject({
            input: { starts_at: "2026-01-01" },
            fields: [{ name: "title" }],
        });
    });
    test("a field the operation does not take is refused", () => {
        expect(withForm([feature("form", { ports: { save: write("products.save", {}, ["nope"]) } })]).issues).toContain(
            "products.save takes no nope",
        );
    });
    test("every feature names the texts of the states its ports can reach", () => {
        const reader: Features = { ...features, reader: { ...(features.cards as Features[string]), owner: "client" } };

        expect(stateIssues(reader)).toEqual([
            "features/editor: a feature that writes names its failed text in its options.",
            "features/reader: a feature that reads names its loading, failed, offline and cached texts in its options; one that lists also names empty.",
        ]);
        expect(stateIssues(form).filter((issue) => issue.includes("features/form"))).toEqual([]);
    });
    test("a spec cannot leave a state text empty", () => {
        const texts = { loading: "", failed: "", offline: "", cached: "", empty: "" };
        const stated: Features = {
            cards: { ...(features.cards as Features[string]), owner: "client", options: { columns: 3, ...texts } },
        };
        const walk = createWalk<Block>({
            params: [],
            client: false,
            session: false,
            backend: true,
            block: { gap: 4 },
            site: {},
            features: stated,
            catalogue,
        });

        compileBlock<Block>(
            {
                features: [
                    feature("cards", {
                        options: { loading: "Loading", failed: "Failed", offline: "Offline", cached: "Saved" },
                        ports: { items: read("products.list") },
                    }),
                ],
            },
            walk,
            "home.blocks[0]",
        );
        expect(walk.issues).toEqual(["home.blocks[0].features[0]: cards leaves its empty text empty."]);
    });
});
