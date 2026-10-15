import { deepMerge, pathGet } from "engine/base";
import { matchPattern } from "engine/parse";
import { bench, do_not_optimize, run } from "engine/tooling";

const document = { meta: { pagination: { page: 3 } } };

bench("matchPattern", () =>
    do_not_optimize(matchPattern("/items/:id/reviews/:reviewId", ["items", "7", "reviews", "9"])),
);
bench("pathGet", () => do_not_optimize(pathGet(document, "meta.pagination.page")));
bench("deepMerge", () => do_not_optimize(deepMerge(document, { meta: { pagination: { size: 20 } } })));

await run();
