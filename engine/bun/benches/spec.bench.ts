import { feature, get, many } from "engine/api";
import { matchScreen } from "engine/screen";
import { catalogueFacts, compileBlock, createWalk } from "engine/spec";
import { bench, do_not_optimize, run } from "engine/tooling";
import { localizeTree } from "engine/translate";
import { z } from "engine/validate";

const item = z.object({ id: z.number(), title: z.string() });
const catalogue = catalogueFacts({
    products: feature({}, { list: get("/products", { limit: z.number().optional() }, many(item)) }),
});
const features = {
    cards: {
        owner: "client" as const,
        options: { title: "", columns: 3 },
        ports: { items: { kind: "list" as const, fields: ["title"] } },
        access: [],
        signals: [],
    },
};
const block = {
    options: {},
    features: Array.from({ length: 20 }, ( _, index ) => ({
        name: "cards",
        heading: index === 0,
        options: { title: { key: "nav.home" } },
        ports: { items: { read: "products.list", input: { limit: 12 } } },
    })),
    blocks: [],
};
const screens = Array.from({ length: 200 }, ( _, index ) => ({
    name: `s${index}`,
    path: index % 2 ? `/items/${index}/:id` : `/items/${index}`,
}));
const tree = {
    title: { key: "nav.home" },
    blocks: Array.from({ length: 50 }, () => ({
        options: { title: { key: "nav.home" } },
        list: [{ key: "nav.home" }, 1, "x"],
    })),
};
const messages = { nav: { home: "Home" } };

bench("compileBlock: 20 features with read ports", () => {

    const walk = createWalk({
        params: [],
        client: true,
        session: true,
        backend: true,
        block: {},
        site: {},
        features,
        catalogue,
    });

    do_not_optimize(compileBlock(block, walk, "home.blocks[0]"));

});
bench("matchScreen over 200 screens (last, parameterised)", () =>
    do_not_optimize(matchScreen(screens, ["items", "199", "7"])),
);
bench("localizeTree: 50 blocks", () => do_not_optimize(localizeTree(tree, messages, "en")));

await run();
