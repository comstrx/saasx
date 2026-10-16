import { describe, expect, test } from "bun:test";
import {
    camelCase,
    catalog,
    collapse,
    digits,
    escapeHtml,
    escapeRegExp,
    fold,
    initials,
    isBlank,
    kebabCase,
    mask,
    pascalCase,
    rank,
    slugify,
    snakeCase,
    titleCase,
    truncate,
    words,
} from "engine/string";

describe("string", () => {

    test("words split on separators, case boundaries and strip diacritics", () => {

        expect(words("Café-au_lait helloWorld 2024")).toEqual(["Cafe", "au", "lait", "hello", "World", "2024"]);
        expect(words("  ")).toEqual([]);

    });
    test("slugs work in any script", () => {

        expect(slugify("Hello, World!")).toBe("hello-world");
        expect(slugify("ملعب بغداد — الفئة الأولى")).toBe("ملعب-بغداد-الفئة-الأولى");
        expect(kebabCase("Workspace Admin LIVE")).toBe("workspace-admin-live");
        expect(snakeCase("Workspace Admin")).toBe("workspace_admin");
        expect(camelCase("workspace admin live")).toBe("workspaceAdminLive");
        expect(pascalCase("workspace-admin")).toBe("WorkspaceAdmin");
        expect(titleCase("the QUICK brown")).toBe("The Quick Brown");

    });
    test("truncate counts graphemes and keeps the ellipsis inside the limit", () => {

        expect(truncate("Hello world", 5)).toBe("Hell…");
        expect(truncate("Hello", 5)).toBe("Hello");
        expect(truncate("héllo wörld", 7, "...")).toBe("héll...");

    });
    test("mask hides the middle and keeps an address domain", () => {

        expect(mask("walk.users@example.test")).toBe("w*********@example.test");
        expect(mask("01099188572", 3, 2)).toBe("010******72");
        expect(mask("ab", 1, 1)).toBe("ab");

    });
    test("small helpers", () => {

        expect(collapse("  a \n b  ")).toBe("a b");
        expect(initials("abdulrahman yasser ali")).toBe("AY");
        expect(escapeHtml("<a href='x'>&</a>")).toBe("&lt;a href=&#39;x&#39;&gt;&amp;&lt;/a&gt;");
        expect(new RegExp(escapeRegExp("a.b*c")).test("a.b*c")).toBe(true);
        expect(isBlank(" ")).toBe(true);
        expect(isBlank("x")).toBe(false);

    });

});
describe("cases and escapes", () => {

    test("every case form agrees on the same words", () => {

        expect(camelCase("Walk  Form_hotel-2")).toBe("walkFormHotel2");
        expect(pascalCase("walk form")).toBe("WalkForm");
        expect(snakeCase("WalkFormHotel")).toBe("walk_form_hotel");
        expect(kebabCase("café Crème")).toBe("cafe-creme");
        expect(titleCase("the big ONE")).toBe("The Big One");

    });
    test("initials take the first letters of the first words only", () => {

        expect(initials("Abdulrahman Yasser Mohamed")).toBe("AY");
        expect(initials("single", 3)).toBe("S");
        expect(initials("")).toBe("");

    });
    test("html escaping covers every dangerous character and nothing else", () => {

        expect(escapeHtml(`<a href="x" title='y'>&</a>`)).toBe("&lt;a href=&quot;x&quot; title=&#39;y&#39;&gt;&amp;&lt;/a&gt;");
        expect(escapeHtml("plain text")).toBe("plain text");

    });
    test("collapse folds any whitespace run and trims; blank is any whitespace or nothing", () => {

        expect(collapse("  a \n\t b  ")).toBe("a b");
        expect(isBlank(" \n")).toBe(true);
        expect(isBlank(null)).toBe(true);
        expect(isBlank("x")).toBe(false);

    });

});
describe("search", () => {

    test("folding erases marks and unifies arabic letter forms; a catalog ranks exact, prefix, then contains", () => {

        expect(fold("مِصْر")).toBe("مصر");
        expect(fold("السعودية")).toBe("السعوديه");
        expect(fold("أحمد إلى آمنة")).toBe("احمد الي امنه");
        expect(fold("Côte")).toBe("cote");
        expect(digits("+20 (10) 99")).toBe("201099");
        expect(rank("ab", ["ab"])).toBe(0);
        expect(rank("ab", ["abc", "xab"])).toBe(1);
        expect(rank("ab", ["xab"])).toBe(3);
        expect(rank("ab", ["zz"])).toBe(-1);

        const fruits = [{ code: "A", words: ["apple", "تفاح"] }, { code: "B", words: ["pineapple"] }, { code: "C", words: ["app"] }];
        const items = catalog(fruits, ( item ) => item.code, ( item ) => item.words);

        expect(items.search("app").map(( item ) => item.code)).toEqual(["C", "A", "B"]);
        expect(items.search("تُفاح").map(( item ) => item.code)).toEqual(["A"]);
        expect(items.get("a")?.code).toBe("A");
        expect(items.has("z")).toBe(false);
        expect(items.search("  ")).toEqual([]);

    });
    test("folding reads arabic-indic and persian digits, persian letter forms and direction marks as the plain text a user means", () => {

        expect(fold("٠١٢٣٤٥٦٧٨٩")).toBe("0123456789");
        expect(fold("۲۰۲۶")).toBe("2026");
        expect(fold("ج.م.\u200f")).toBe("ج.م.");
        expect(fold("ی ک")).toBe("ي ك");
        expect(fold("  Multiple   Spaces ")).toBe("multiple spaces");

    });
    test("a catalog finds a word without its arabic article, every typed word by its start, and ranks a whole-field match above a word match", () => {

        const items = catalog([
            { code: "AE", names: ["United Arab Emirates", "الإمارات العربية المتحدة"] },
            { code: "SA", names: ["Saudi Arabia", "المملكة العربية السعودية"] },
            { code: "AR", names: ["Arabic", "العربية"] },
        ], ( item ) => item.code, ( item ) => item.names);
        const codes = ( query: string ) => items.search(query).map(( item ) => item.code);

        expect(codes("امارات")).toEqual(["AE"]);
        expect(codes("الامارات")).toEqual(["AE"]);
        expect(codes("united emi")).toEqual(["AE"]);
        expect(codes("سعوديه")).toEqual(["SA"]);
        expect(codes("arab")).toEqual(["AR", "AE", "SA"]);
        expect(codes("عربي")).toEqual(["AR", "AE", "SA"]);
        expect(codes("emirates united")).toEqual(["AE"]);

    });

});
