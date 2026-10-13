import { describe, expect, test } from "bun:test";
import { defineEmoji, groups, keyOf, plain, tones, tuples } from "@engine/emoji";

const emoji = defineEmoji();
const few = defineEmoji({ folder: "/images/emoji", animated: ["❤️", "👍"] });

describe("the catalog", () => {

    test("every entry carries both names, a known group, and a key that round-trips its glyph", () => {

        expect(tuples.length).toBeGreaterThan(1800);
        expect(groups.map(( group ) => group.key)).toEqual(["smileys", "people", "nature", "food", "travel", "activities", "objects", "symbols", "flags"]);
        expect(tones.map(( tone ) => tone.key)).toEqual(["light", "mediumLight", "medium", "mediumDark", "dark"]);

        const keys = new Set<string>();

        for ( const entry of emoji.all ) {

            expect(entry.name.en && entry.name.ar).toBeTruthy();
            expect(entry.group).not.toBe("");
            expect(keys.has(entry.key)).toBe(false);
            keys.add(entry.key);
            expect(keyOf(entry.glyph)).toBe(entry.key);

        }

        expect(emoji.all.filter(( entry ) => entry.assets.static).length).toBeGreaterThan(1400);
        expect(emoji.all.filter(( entry ) => entry.assets.animated).length).toBe(100);

    });
    test("a glyph is found with or without its presentation selector, and a toned glyph finds its base", () => {

        expect(emoji.get("❤️")?.name.en).toBe("red heart");
        expect(emoji.get("❤")?.name.ar).toBe("قلب أحمر");
        expect(emoji.get("👍🏿")?.glyph).toBe("👍");
        expect(emoji.get("x")).toBeUndefined();
        expect(plain("❤️")).toBe("❤");
        expect(keyOf("👍🏻")).toBe("1f44d-1f3fb");
        expect(keyOf("❤️")).toBe("2764");

    });

});
describe("search", () => {

    test("arabic and english names and keywords find an emoji, exact names first", () => {

        expect(emoji.search("قبول")[0]?.glyph).toBe("👍");
        expect(emoji.search("thumbs up")[0]?.glyph).toBe("👍");
        expect(emoji.search("مصر")[0]?.glyph).toBe("🇪🇬");
        expect(emoji.search("بحبك").some(( entry ) => entry.glyph === "❤️")).toBe(true);
        expect(emoji.search("❤️")[0]?.glyph).toBe("❤️");
        expect(emoji.search("")).toEqual([]);
        expect(emoji.search("zzzzz")).toEqual([]);
        expect(emoji.search("face", 5)).toHaveLength(5);
        expect(emoji.of("flags").length).toBeGreaterThan(250);
        expect(emoji.of("nope")).toEqual([]);

    });

});
describe("skin tones", () => {

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
describe("assets", () => {

    test("paths follow the folder and the key; a tone has a still only when its base takes tones", () => {

        expect(emoji.staticOf("👍")).toBe("images/emoji/static/1f44d.webp");
        expect(few.staticOf("👍🏿")).toBe("/images/emoji/static/1f44d-1f3ff.webp");
        expect(emoji.staticOf("❤️🏿")).toBeUndefined();
        expect(emoji.get("🤝")?.toned).toBe(true);
        expect(emoji.get("🤝")?.assets).toEqual({ static: true, animated: true, tones: false });
        expect(emoji.staticOf("🤝🏿")).toBeUndefined();
        expect(emoji.display("🤝🏿", { context: "picker" })).toEqual({ kind: "glyph", glyph: "🤝🏿" });
        expect(emoji.staticOf("🇪🇬")).toBeUndefined();
        expect(emoji.animatedOf("❤️")).toBe("images/emoji/animated/2764.webp");
        expect(emoji.animatedOf("👍🏿")).toBeUndefined();
        expect(few.animatedOf("👍")).toBe("/images/emoji/animated/1f44d.webp");
        expect(few.animatedOf("😂")).toBeUndefined();

    });
    test("the file lists name what a surface must carry", () => {

        const files = few.files();
        const withTones = few.files({ tones: true });

        expect(files.animated).toEqual(["2764.webp", "1f44d.webp"]);
        expect(files.static).toContain("1f44d.webp");
        expect(files.static).not.toContain("1f44d-1f3ff.webp");
        expect(withTones.static).toContain("1f44d-1f3ff.webp");
        expect(withTones.static.length).toBeGreaterThan(files.static.length + 1500);

    });

});
describe("display policy", () => {

    test("inline text is always the glyph; a picker is still; a live reaction moves only when active and motion is welcome", () => {

        expect(few.display("👍", { context: "inline", active: true })).toEqual({ kind: "glyph", glyph: "👍" });
        expect(few.display("👍", { context: "picker", active: true })).toEqual({ kind: "static", src: "/images/emoji/static/1f44d.webp", glyph: "👍" });
        expect(few.display("👍", { context: "reaction", active: true })).toEqual({ kind: "animated", src: "/images/emoji/animated/1f44d.webp", glyph: "👍" });
        expect(few.display("👍", { context: "reaction", active: true, reducedMotion: true }).kind).toBe("static");
        expect(few.display("👍", { context: "reaction" }).kind).toBe("static");
        expect(few.display("😂", { context: "standalone", active: true }).kind).toBe("static");
        expect(few.display("🇪🇬", { context: "standalone", active: true })).toEqual({ kind: "glyph", glyph: "🇪🇬" });
        expect(few.display("x", { context: "reaction", active: true })).toEqual({ kind: "glyph", glyph: "x" });

    });

});
