import { str } from "@/std/str";

describe("str.digits", () => {

    it("converts arabic-indic and extended digits", () => {

        expect(str.digits("٠١٢٣٤٥٦٧٨٩")).toBe("0123456789");
        expect(str.digits("۱۱۱۱۱")).toBe("11111");

    });

});

describe("str.fold", () => {

    it("folds arabic letter variants to one form", () => {

        expect(str.fold("الأردن")).toBe(str.fold("الاردن"));
        expect(str.fold("مصرى")).toBe(str.fold("مصري"));
        expect(str.fold("السعوديّة")).toBe(str.fold("السعوديه"));

    });
    it("folds latin case and accents", () => {

        expect(str.fold("Türkçe")).toBe(str.fold("turkce"));
        expect(str.fold("  Saudi   Arabia ")).toBe("saudi arabia");

    });

});

describe("str.matches", () => {

    it("matches across scripts and spelling variants", () => {

        expect(str.matches("الإمارات", "الامارات")).toBe(true);
        expect(str.matches("United States", "united")).toBe(true);
        expect(str.matches("Egypt", "")).toBe(true);
        expect(str.matches("Egypt", "iraq")).toBe(false);

    });

});

describe("str.mask", () => {

    it("keeps the leading characters only", () => {

        expect(str.mask("comstrx@gmail.com", 3)).toBe("com**************");
        expect(str.mask("ab", 3)).toBe("ab");

    });

});
