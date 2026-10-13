import { describe, expect, test } from "bun:test";
import { camelCase, collapse, escapeHtml, escapeRegExp, initials, isBlank, kebabCase, mask, pascalCase, slugify, snakeCase, titleCase, truncate, words } from "@engine/string";

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

        expect(mask("walk.saasx@example.test")).toBe("w*********@example.test");
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
