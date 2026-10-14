import { bench, do_not_optimize, run } from "@engine/tooling";
import { defineEmoji, defineWorld } from "@engine/world";

const world = defineWorld();
const mine = defineWorld({ countries: ["EG", "SA", "AE"], currencies: ["EGP", "SAR", "USD"] });
const emoji = defineEmoji();

bench("defineWorld (all)", () => do_not_optimize(defineWorld()));
bench("countries.search arabic", () => do_not_optimize(world.countries.search("مصر")));
bench("countries.search latin prefix", () => do_not_optimize(world.countries.search("un")));
bench("currencies.search by country", () => do_not_optimize(world.currencies.search("السعودية")));
bench("dialing.search", () => do_not_optimize(world.dialing.search("+20")));
bench("filtered countries.search", () => do_not_optimize(mine.countries.search("e")));
bench("defineEmoji", () => do_not_optimize(defineEmoji()));
bench("emoji search arabic", () => do_not_optimize(emoji.search("قلب")));
bench("emoji search latin prefix", () => do_not_optimize(emoji.search("hea")));
bench("emoji search glyph", () => do_not_optimize(emoji.search("❤️")));
bench("emoji get", () => do_not_optimize(emoji.get("👍🏿")));
bench("emoji display", () => do_not_optimize(emoji.display("👍", { context: "reaction", active: true })));

await run();
