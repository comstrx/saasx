import { bench, do_not_optimize, run } from "engine/tooling";
import { countries, cssVariables, currencies, defineTokens, defineWorld, emojis, keys } from "engine/world";

const mine = defineWorld({ countries: ["EG", "SA", "AE"], currencies: ["EGP", "SAR", "USD"] });
const tokens = defineTokens({
    colors: { light: { ink: "#111", body: "#fff" }, dark: { ink: "#eee", body: "#000" } },
    space: { 0: 0, 1: 4, 2: 8, 4: 16 },
    radius: { sm: 6, md: 12 },
    type: { md: { size: 16, line: 24, weight: 400 } },
});

countries.search("warm");
emojis.search("warm");

bench("defineWorld (all)", () => do_not_optimize(defineWorld()));
bench("countries.search arabic", () => do_not_optimize(countries.search("مصر")));
bench("countries.search latin prefix", () => do_not_optimize(countries.search("un")));
bench("countries.search two words", () => do_not_optimize(countries.search("united emi")));
bench("currencies.search by country", () => do_not_optimize(currencies.search("السعودية")));
bench("keys.search digits", () => do_not_optimize(keys.search("+20")));
bench("keys.search area", () => do_not_optimize(keys.search("1268")));
bench("filtered countries.search", () => do_not_optimize(mine.countries.search("e")));
bench("emojis.search arabic", () => do_not_optimize(emojis.search("قلب")));
bench("emojis.search latin prefix", () => do_not_optimize(emojis.search("hea")));
bench("emojis.get", () => do_not_optimize(emojis.get("❤")));
bench("emojis.imageOf", () => do_not_optimize(emojis.imageOf("🇪🇬")));
bench("cssVariables", () => do_not_optimize(cssVariables(tokens, "light", ":root")));

await run();
