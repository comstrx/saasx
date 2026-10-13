import { describe, expect, test } from "bun:test";
import {
    createIcons,
    cssVariables,
    defineMotion,
    defineTokens,
    fontFace,
    fontStack,
    nativeTokens,
    transition,
} from "@engine/ui";

describe("tokens", () => {
    const tokens = defineTokens({ colors: { light: { ink: "#111" }, dark: { ink: "#eee" } }, space: { 5: 20 } });

    test("scales are the engine's unless patched, and each scheme keeps its own palette", () => {
        expect(tokens.space[5]).toBe(20);
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
    test("reduced motion collapses every duration and transitions follow", () => {
        const full = defineMotion(false);
        const reduced = defineMotion(true);

        expect(transition(full, ["opacity", "transform"], "fast", "enter")).toBe(
            "opacity 120ms cubic-bezier(0, 0, 0, 1), transform 120ms cubic-bezier(0, 0, 0, 1)",
        );
        expect(transition(reduced, ["opacity"])).toBe("opacity 0ms cubic-bezier(0.2, 0, 0, 1)");
        expect(reduced.reduced).toBe(true);
    });
});
describe("fonts and icons", () => {
    test("font faces and stacks render as css", () => {
        expect(fontFace({ family: "Site-ar", src: "/assets/fonts/ar.woff2", weight: 400 })).toBe(
            '@font-face { font-family: "Site-ar"; src: url("/assets/fonts/ar.woff2"); font-weight: 400; font-style: normal; font-display: swap; }',
        );
        expect(fontStack(["Site-ar", "Site-en"])).toBe('"Site-ar", "Site-en", sans-serif');
    });
    test("unknown icons resolve to the fallback", () => {
        const icons = createIcons({ house: "H", tag: "T" }, "?");

        expect(icons.names).toEqual(["house", "tag"]);
        expect(icons.get("tag")).toBe("T");
        expect(icons.get("nothing")).toBe("?");
        expect(icons.has("constructor")).toBe(false);
    });
});
