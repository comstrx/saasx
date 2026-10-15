import { expandTemplate, matchPattern, parseQuery, queryString, segmentsOf } from "engine/parse";
import { bench, do_not_optimize, run } from "engine/tooling";

const segments = segmentsOf("/en/catalog/427-walk-hotel");

bench("matchPattern", () => do_not_optimize(matchPattern("/:locale/catalog/:id", segments)));
bench("expandTemplate", () => do_not_optimize(expandTemplate("/catalogs/{id}/translations/{locale}", { id: 427, locale: "ar" })));
bench("queryString nested", () => do_not_optimize(queryString({ filters: { type: ["hotel", "room"], trashed: false }, page: 2 })));
bench("parseQuery nested", () => do_not_optimize(parseQuery("filters[type][]=hotel&filters[type][]=room&page=2")));

await run();
