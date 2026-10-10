import { contactable } from "@/std/identity";

describe("contactable", () => {

    test("a whole email or phone is worth a lookup", () => {

        expect(contactable("qa@zainlak.test")).toBe(true);
        expect(contactable("+966 55 026 1054")).toBe(true);
        expect(contactable("0550261054")).toBe(true);

    });

    test("a half-typed address never spends a lookup", () => {

        expect(contactable("qa@zainlak")).toBe(false);
        expect(contactable("qa@zainlak.")).toBe(false);
        expect(contactable("qa@zainlak.t")).toBe(false);
        expect(contactable("+96655")).toBe(false);
        expect(contactable("qa zainlak")).toBe(false);

    });

});
