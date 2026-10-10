import { formatAmount, symbolLeads } from "@/std/number";

const isolate = /[⁦⁩]/gu;

const plain = ( value: string ): string => value.replace(isolate, "").replace(/ /gu, " ");

describe("formatAmount", () => {

    test("puts an arabic symbol after the amount", () => {

        expect(plain(formatAmount("ar", "ج.م", 1023.97, 2))).toBe("1,023.97 ج.م");
        expect(plain(formatAmount("ar", "ر.س", 250, 2))).toBe("250.00 ر.س");

    });

    test("keeps a latin symbol before the amount", () => {

        expect(plain(formatAmount("en", "$", 1023.97, 2))).toBe("$1,023.97");
        expect(plain(formatAmount("en", "CHF", 40, 0))).toBe("CHF 40");

    });

    test("keeps the sign glued to the digits", () => {

        expect(plain(formatAmount("ar", "ج.م", -55.5, 2))).toBe("-55.50 ج.م");
        expect(plain(formatAmount("en", "$", -55.5, 2))).toBe("$-55.50");

    });

    test("isolates the amount so bidi never reorders the digits", () => {

        expect(formatAmount("ar", "ج.م", 12, 2)).toContain("⁦");
        expect(formatAmount("en", "$", 12, 2)).toContain("⁦");

    });

    test("reads the direction from the symbol script", () => {

        expect(symbolLeads("$")).toBe(true);
        expect(symbolLeads("ج.م")).toBe(false);

    });

});
