import { describe, expect, test } from "bun:test";
import {
    createIcons,
    cssVariables,
    defineMotion,
    defineTokens,
    fontFace,
    fontStack,
    glyphs,
    iconNames,
    nativeTokens,
    transition,
} from "@engine/ui";

const scales = {
    space: { 0: 0, 4: 16 },
    radius: { full: 9999 },
    type: { lg: { size: 20, line: 28, weight: 600 as const }, md: { size: 16, line: 24, weight: 400 as const } },
};

describe("tokens", () => {
    const tokens = defineTokens({ colors: { light: { ink: "#111" }, dark: { ink: "#eee" } }, ...scales });

    test("every scale comes from the surface, and each scheme keeps its own palette", () => {
        expect(tokens.space[4]).toBe(16);
        expect(tokens.colors.dark.ink).toBe("#eee");
        expect(tokens.radius.full).toBe(9999);
    });
    test("css variables project a scheme under a selector in rem", () => {
        const css = cssVariables(tokens, "dark", '[data-theme="dark"]');

        expect(css.startsWith('[data-theme="dark"] {\n')).toBe(true);
        expect(css).toContain("--ink: #eee;");
        expect(css).toContain("--gap-4: 1rem;");
        expect(css).toContain("--gap-0: 0;");
        expect(css).toContain("--radius-full: 999rem;");
        expect(css).toContain("--type-lg-weight: 600;");
    });
    test("native tokens keep plain numbers", () => {
        const native = nativeTokens(tokens, "light");

        expect(native.colors.ink).toBe("#111");
        expect(native.space[4]).toBe(16);
        expect(native.type.md).toEqual({ size: 16, line: 24, weight: 400 });
    });
});
describe("motion", () => {
    const presets = { durations: { fast: 120, base: 200 }, easings: { standard: "ease", enter: "ease-out" } };

    test("reduced motion collapses every duration and transitions follow", () => {
        const full = defineMotion(presets, false);
        const reduced = defineMotion(presets, true);

        expect(transition(full, ["opacity", "transform"], "fast", "enter")).toBe(
            "opacity 120ms ease-out, transform 120ms ease-out",
        );
        expect(transition(reduced, ["opacity"], "base", "standard")).toBe("opacity 0ms ease");
        expect(() => transition(full, ["opacity"], "slow", "standard")).toThrow("Unknown motion");
    });
});
describe("fonts and icons", () => {
    test("font faces and stacks render as css", () => {
        expect(fontFace({ family: "Site-ar", src: "/fonts/ar.woff2", weight: 400 })).toBe(
            '@font-face { font-family: "Site-ar"; src: url("/fonts/ar.woff2"); font-weight: 400; font-style: normal; font-display: swap; }',
        );
        expect(fontStack(["Site-ar", "Site-en"])).toBe('"Site-ar", "Site-en", sans-serif');
    });
    test("every named glyph is a list of svg nodes", () => {
        for (const name of iconNames) {
            const nodes = glyphs[name];

            expect(nodes.length).toBeGreaterThan(0);
            expect(nodes.every(([tag, attrs]) => typeof tag === "string" && typeof attrs === "object")).toBe(true);
        }
    });
    test("unknown icons resolve to the fallback", () => {
        const icons = createIcons({ house: "H", tag: "T" }, "?");

        expect(icons.names).toEqual(["house", "tag"]);
        expect(icons.get("tag")).toBe("T");
        expect(icons.get("nothing")).toBe("?");
        expect(icons.has("constructor")).toBe(false);
    });
});
