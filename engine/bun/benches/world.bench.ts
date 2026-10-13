import { defineWorld } from "@engine/world";
import { bench, do_not_optimize, run } from "mitata";

const world = defineWorld();
const mine = defineWorld({ countries: ["EG", "SA", "AE"], currencies: ["EGP", "SAR", "USD"] });

bench("defineWorld (all)", () => do_not_optimize(defineWorld()));
bench("countries.search arabic", () => do_not_optimize(world.countries.search("مصر")));
bench("countries.search latin prefix", () => do_not_optimize(world.countries.search("un")));
bench("currencies.search by country", () => do_not_optimize(world.currencies.search("السعودية")));
bench("dialing.search", () => do_not_optimize(world.dialing.search("+20")));
bench("filtered countries.search", () => do_not_optimize(mine.countries.search("e")));

await run();
