import { defineEmoji } from "@engine/emoji";
import { bench, do_not_optimize, run } from "mitata";

const emoji = defineEmoji();

bench("defineEmoji", () => do_not_optimize(defineEmoji()));
bench("search arabic", () => do_not_optimize(emoji.search("قلب")));
bench("search latin prefix", () => do_not_optimize(emoji.search("hea")));
bench("search glyph", () => do_not_optimize(emoji.search("❤️")));
bench("get", () => do_not_optimize(emoji.get("👍🏿")));
bench("display", () => do_not_optimize(emoji.display("👍", { context: "reaction", active: true })));

await run();
