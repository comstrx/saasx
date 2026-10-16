import { describe, expect, test } from "bun:test";
import { del, get, many, need, post, feature as spec } from "engine/api";
import {
    catalogueFacts,
    compileBlock,
    createWalk,
    type Features,
    feature,
    read,
    type SiteFeature,
    stateIssues,
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

function _compile ( children: SiteFeature<Block>[], backend = true, params: string[] = [] ) {

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
describe("forms and states", () => {

    const form: Features = {
        ...features,
        form: {
            owner: "client",
            options: { failed: "x", errors: {} },
            ports: { save: { kind: "write" } },
            access: [],
            signals: [],
        },
    };
    const spoken = ( children: SiteFeature<Block>[] ): SiteFeature<Block>[] =>
        children.map(( child ) => ({ ...child, options: { errors: { key: "errors" }, ...child.options } }));
    const withForm = ( given: SiteFeature<Block>[] ) => {

        const children = spoken(given);
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
            permissions: [],
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
            {
                features: [
                    feature("form", {
                        options: { errors: { key: "errors" } },
                        ports: { save: write("products.save") },
                    }),
                ],
            },
            walk,
            "home.blocks[0]",
        );

        expect(block.features[0]?.ports.save).toMatchObject({ touches: ["products"] });

    });
    test("an object option may name a message branch, resolved when the tree localizes", () => {

        const labeled: Features = {
            ...form,
            form: { ...(form.form as Features[string]), options: { failed: "x", labels: {}, errors: {} } },
        };
        const walk = createWalk<Block>({
            params: [],
            client: false,
            session: false,
            backend: true,
            block: { gap: 4 },
            site: {},
            features: labeled,
            catalogue,
        });

        compileBlock<Block>(
            {
                features: [
                    feature("form", {
                        options: { labels: { key: "catalog.fields" }, errors: { key: "errors" } },
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
                        options: { errors: { key: "errors" } },
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
            "features/editor: a feature that writes names its failed text and an errors map in its options.",
            "features/reader: a feature that reads names its loading, failed, offline and cached texts in its options; " +
                "one that lists also names empty.",
        ]);
        expect(stateIssues(form).filter(( issue ) => issue.includes("features/form"))).toEqual([]);

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
                        options: { loading: "Loading", failed: "Failed", offline: "Offline", cached: "Saved", empty: "" },
                        ports: { items: read("products.list") },
                    }),
                ],
            },
            walk,
            "home.blocks[0]",
        );
        expect(walk.issues).toEqual(["home.blocks[0].features[0]: cards leaves its empty text empty."]);

    });
    test("a state text the spec leaves out speaks the surface's own state message, and a spec may still name its own", () => {

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
        const block = compileBlock<Block>(
            { features: [feature("cards", { options: { loading: { key: "cards.loading" } }, ports: { items: read("products.list") } })] },
            walk,
            "home.blocks[0]",
        );

        expect(walk.issues).toEqual([]);
        expect(block.features[0]?.options).toMatchObject({
            loading: { key: "cards.loading" },
            failed: { key: "state.failed" },
            offline: { key: "state.offline" },
            cached: { key: "state.cached" },
            empty: { key: "state.empty" },
        });

    });

});
describe("permissions on ports", () => {

    const guarded = catalogueFacts({
        products: spec(
            { permissions: ["user"] },
            {
                list: get("/products", {}, many(item)),
                remove: need(["delete_products"], del("/products/{id}", { id: z.number() }, z.unknown())),
            },
        ),
    });
    const pane: Features = {
        pane: {
            owner: "client",
            options: { loading: "x", failed: "x", offline: "x", cached: "x", empty: "x", errors: {} },
            ports: { items: { kind: "list" }, remove: { kind: "write", required: false } },
            access: [],
            signals: [],
        },
    };

    test("a write port carries what it needs; the feature is gated only by what it reads", () => {

        const walk = createWalk<Block>({
            params: [],
            client: true,
            session: true,
            backend: true,
            block: { gap: 4 },
            site: {},
            features: pane,
            catalogue: guarded,
        });
        const block = compileBlock<Block>(
            {
                features: [
                    feature("pane", {
                        options: { errors: { key: "errors" } },
                        ports: { items: read("products.list"), remove: write("products.remove", { id: 1 }) },
                    }),
                ],
            },
            walk,
            "home.blocks[0]",
        );
        const compiled = block.features[0];

        expect(walk.issues).toEqual([]);
        expect(compiled?.access).toEqual(["user"]);
        expect(compiled?.ports.remove).toMatchObject({ permissions: ["user", "delete_products"] });

    });
    test("a writing feature binds its errors dictionary", () => {

        expect(
            stateIssues({
                bare: {
                    ...(pane.pane as Features[string]),
                    options: { loading: "x", failed: "x", offline: "x", cached: "x", empty: "x" },
                },
            }),
        ).toEqual(["features/bare: a feature that writes names its failed text and an errors map in its options."]);

        const walk = createWalk<Block>({
            params: [],
            client: true,
            session: true,
            backend: true,
            block: { gap: 4 },
            site: {},
            features: pane,
            catalogue: guarded,
        });

        compileBlock<Block>(
            {
                features: [
                    feature("pane", {
                        options: { errors: {} },
                        ports: { items: read("products.list"), remove: write("products.remove", { id: 1 }) },
                    }),
                ],
            },
            walk,
            "home.blocks[0]",
        );
        expect(walk.issues).toEqual(["home.blocks[0].features[0]: pane leaves its errors map empty."]);

    });

});
