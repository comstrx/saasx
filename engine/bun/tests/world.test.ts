import { describe, expect, test } from "bun:test";
import { fold } from "@engine/string";
import { countries, currencies, defineEmoji, defineWorld, emojiFolder, emojiKey, emojiMotions, flagEmoji, flagFolder, languages, plainEmoji } from "@engine/world";

const world = defineWorld();
const emoji = defineEmoji();
const few = defineEmoji({ folder: "/images/emoji", animated: ["❤️", "👍"] });

describe("the whole world", () => {

    test("every country names its currencies and languages in the tables and carries three names", () => {

        expect(countries.length).toBeGreaterThan(240);

        for ( const country of countries ) {

            expect(country.name.en && country.name.ar && country.name.native).toBeTruthy();

            for ( const code of country.currencies ) expect(world.currencies.has(code)).toBe(true);
            for ( const code of country.languages ) expect(world.languages.has(code)).toBe(true);

        }

        expect(currencies.every(( c ) => c.countries.every(( alpha2 ) => world.countries.has(alpha2)))).toBe(true);
        expect(languages.find(( l ) => l.code === "ar")?.direction).toBe("rtl");

    });
    test("a country is found by any of its names, codes or dialing code, exact matches first", () => {

        expect(world.countries.search("مصر")[0]?.alpha2).toBe("EG");
        expect(world.countries.search("مِصْر")[0]?.alpha2).toBe("EG");
        expect(world.countries.search("egypt")[0]?.alpha2).toBe("EG");
        expect(world.countries.search("EGY")[0]?.alpha2).toBe("EG");
        expect(world.countries.search("+20")[0]?.alpha2).toBe("EG");
        expect(world.countries.search("Côte")[0]?.alpha2).toBe("CI");
        expect(world.countries.search("cote d")[0]?.alpha2).toBe("CI");
        expect(world.countries.search("السعوديه")[0]?.alpha2).toBe("SA");
        expect(world.countries.search("zzzz")).toEqual([]);
        expect(world.countries.search("")).toEqual([]);

    });
    test("a currency is found by code, symbol, any name, or the country that spends it", () => {

        expect(world.currencies.search("ريال سعودي")[0]?.code).toBe("SAR");
        expect(world.currencies.search("السعودية")[0]?.code).toBe("SAR");
        expect(world.currencies.search("$")[0]?.code).toBe("USD");
        expect(world.currencies.search("Egyptian")[0]?.code).toBe("EGP");
        expect(world.currencies.search("eg").some(( c ) => c.code === "EGP")).toBe(true);
        expect(world.currenciesOf("eg").map(( c ) => c.code)).toEqual(["EGP"]);
        expect(world.countriesOf("SAR").map(( c ) => c.alpha2)).toEqual(["SA"]);
        expect(world.currencies.get("usd")?.digits).toBe(2);
        expect(world.currencies.get("JPY")?.digits).toBe(0);

    });
    test("dialing searches by digits however they are typed", () => {

        expect(world.dialing.search("+2 0").map(( c ) => c.alpha2)).toContain("EG");
        expect(world.dialing.search("966")[0]?.alpha2).toBe("SA");
        expect(world.dialing.of("sa")).toBe("+966");
        expect(world.dialing.search("")).toEqual([]);

    });

});
describe("a surface's world", () => {

    test("a filter keeps only what the backend supports, in the order given, and refuses strangers", () => {

        const mine = defineWorld({ countries: ["sa", "EG"], currencies: ["SAR", "EGP", "USD"], languages: ["ar", "en"] });

        expect(mine.countries.all.map(( c ) => c.alpha2)).toEqual(["SA", "EG"]);
        expect(mine.countries.search("egypt")).toHaveLength(1);
        expect(mine.countries.search("france")).toEqual([]);
        expect(mine.currencies.all.map(( c ) => c.code)).toEqual(["SAR", "EGP", "USD"]);
        expect(mine.currenciesOf("US")).toEqual([]);
        expect(mine.languages.all.map(( l ) => l.code)).toEqual(["ar", "en"]);
        expect(() => defineWorld({ countries: ["XX"] })).toThrow("Unknown countries: XX");

    });
    test("flags and emoji are drawn from where a compile publishes them unless a surface names another folder", () => {

        expect(flagFolder).toBe("/_generated/images/flag");
        expect(emojiFolder).toBe("/_generated/images/emoji");
        expect(defineWorld().flagOf("EG")).toBe("/_generated/images/flag/eg.svg");
        expect(defineEmoji().staticOf("👍")).toBe("/_generated/images/emoji/static/1f44d.webp");
        expect(defineWorld({ flags: { format: "webp" } }).flagOf("sa")).toBe("/_generated/images/flag/sa.webp");
        expect(defineWorld({ flags: { folder: "/images/flag" } }).flagOf("AE")).toBe("/images/flag/ae.svg");
        expect(flagEmoji("EG")).toBe("🇪🇬");
        expect(flagEmoji("e")).toBe("");
        expect(fold("Côte d'Ivoire")).toBe("cote d'ivoire");

    });

});
describe("the emoji catalog", () => {

    test("every entry carries both names, a group, a unique key that round-trips its glyph, and motion only when flagged", () => {

        const keys = new Set<string>();

        for ( const entry of emoji.all ) {

            expect(entry.name.en && entry.name.ar && entry.group).toBeTruthy();
            expect(keys.has(entry.key)).toBe(false);
            expect(emojiKey(entry.glyph)).toBe(entry.key);
            expect(entry.assets.animated).toBe(emojiMotions[entry.key] !== undefined);
            keys.add(entry.key);

        }

        expect(Object.keys(emojiMotions).every(( key ) => keys.has(key))).toBe(true);

    });
    test("a glyph is found with or without its presentation selector, and a toned glyph finds its base", () => {

        expect(emoji.get("❤️")?.name.en).toBe("red heart");
        expect(emoji.get("❤")?.name.ar).toBe("قلب أحمر");
        expect(emoji.get("👍🏿")?.glyph).toBe("👍");
        expect(emoji.get("x")).toBeUndefined();
        expect(plainEmoji("❤️")).toBe("❤");
        expect(emojiKey("👍🏻")).toBe("1f44d-1f3fb");
        expect(emojiKey("❤️")).toBe("2764");

    });

});
describe("emoji search", () => {

    test("arabic and english names and keywords find an emoji, exact names first", () => {

        expect(emoji.search("قبول")[0]?.glyph).toBe("👍");
        expect(emoji.search("thumbs up")[0]?.glyph).toBe("👍");
        expect(emoji.search("مصر")[0]?.glyph).toBe("🇪🇬");
        expect(emoji.search("بحبك").some(( entry ) => entry.glyph === "❤️")).toBe(true);
        expect(emoji.search("❤️")[0]?.glyph).toBe("❤️");
        expect(emoji.search("")).toEqual([]);
        expect(emoji.search("zzzzz")).toEqual([]);
        expect(emoji.search("face", 5)).toHaveLength(5);
        expect(emoji.of("flags").every(( entry ) => entry.group === "flags")).toBe(true);
        expect(emoji.of("nope")).toEqual([]);

    });

});
describe("emoji skin tones", () => {

    test("a tone applies to every person in a toned glyph and never to one that takes none", () => {

        expect(emoji.tone("👍", "dark")).toBe("👍🏿");
        expect(emoji.tone("👍🏻", "medium")).toBe("👍🏽");
        expect(emoji.tone("👍🏻")).toBe("👍");
        expect(emoji.tone("🧑‍🤝‍🧑", "light")).toBe("🧑🏻‍🤝‍🧑🏻");
        expect(emoji.tone("❤️", "dark")).toBe("❤️");
        expect(emoji.tone("x", "dark")).toBe("x");
        expect(emoji.get("👍")?.toned).toBe(true);
        expect(emoji.get("❤️")?.toned).toBe(false);

    });

});
describe("emoji assets", () => {

    test("stills follow the folder and the key; a tone has a still only when its base has all five toned renders", () => {

        expect(emoji.staticOf("👍")).toBe("/_generated/images/emoji/static/1f44d.webp");
        expect(few.staticOf("👍🏿")).toBe("/images/emoji/static/1f44d-1f3ff.webp");
        expect(emoji.staticOf("❤️🏿")).toBeUndefined();
        expect(emoji.staticOf("🇪🇬")).toBe("/_generated/images/emoji/static/1f1ea-1f1ec.webp");
        expect(emoji.staticOf("🫩")).toBeUndefined();

        const handshake = emoji.get("🤝");

        expect(emoji.staticOf("🤝🏿") === undefined).toBe(!handshake?.assets.tones);

    });
    test("a motion is a sprite sheet whose grid holds exactly its frames, offered only for the surface's chosen glyphs", () => {

        const sprite = few.motionOf("❤️");

        expect(sprite?.src).toBe("/images/emoji/motion/2764.webp");
        expect(sprite && sprite.columns * sprite.rows).toBe(sprite?.frames);
        expect(sprite && sprite.ms > 0).toBe(true);
        expect(few.motionOf("👍🏿")).toBeUndefined();
        expect(few.motionOf("😂")).toBeUndefined();
        expect(emoji.motionOf("😂")?.src).toBe("/_generated/images/emoji/motion/1f602.webp");

    });
    test("the file lists name what a surface must carry, tones only when asked", () => {

        const files = few.files();
        const withTones = few.files({ tones: true });

        expect(files.motion.sort()).toEqual(["1f44d.webp", "2764.webp"]);
        expect(files.static).toContain("1f44d.webp");
        expect(files.static).not.toContain("1f44d-1f3ff.webp");
        expect(withTones.static).toContain("1f44d-1f3ff.webp");
        expect(new Set(emoji.files().motion)).toEqual(new Set(Object.keys(emojiMotions).map(( key ) => `${key}.webp`)));

    });

});
describe("emoji display policy", () => {

    test("inline text is always the glyph; a picker is still; a live reaction moves only when active and motion is welcome", () => {

        const moving = few.display("👍", { context: "reaction", active: true });

        expect(few.display("👍", { context: "inline", active: true })).toEqual({ kind: "glyph", glyph: "👍" });
        expect(few.display("👍", { context: "picker", active: true })).toEqual({ kind: "static", src: "/images/emoji/static/1f44d.webp", glyph: "👍" });
        expect(moving.kind === "animated" && moving.sprite.src).toBe("/images/emoji/motion/1f44d.webp");
        expect(moving.kind === "animated" && moving.still).toBe("/images/emoji/static/1f44d.webp");
        expect(few.display("👍", { context: "reaction", active: true, reducedMotion: true }).kind).toBe("static");
        expect(few.display("👍", { context: "reaction" }).kind).toBe("static");
        expect(few.display("😂", { context: "standalone", active: true }).kind).toBe("static");
        expect(few.display("🫩", { context: "standalone", active: true })).toEqual({ kind: "glyph", glyph: "🫩" });
        expect(few.display("x", { context: "reaction", active: true })).toEqual({ kind: "glyph", glyph: "x" });

    });

});
