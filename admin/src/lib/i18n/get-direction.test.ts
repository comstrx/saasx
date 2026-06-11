import { describe, expect, it } from "vitest";
import { getDirection } from "./get-direction";

describe("getDirection", () => {

    it("maps arabic to rtl", () => {

        expect(getDirection("ar")).toBe("rtl");

    });

    it("maps english to ltr", () => {

        expect(getDirection("en")).toBe("ltr");

    });

});
