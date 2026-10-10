import { alpha, over } from "@/std/color";

describe("color.over", () => {

    it("flattens a translucent layer onto its ground", () => {

        expect(over("rgba(255, 255, 255, 0.1)", "#1b1b1f")).toBe("#323235");
        expect(over(alpha("#000000", 0.5), "#ffffff")).toBe("#808080");

    });

    it("keeps an opaque colour and an unreadable ground as they are", () => {

        expect(over("#123456", "#ffffff")).toBe("#123456");
        expect(over("rgba(255, 255, 255, 0.1)", "transparent")).toBe("rgba(255, 255, 255, 0.1)");

    });

});
