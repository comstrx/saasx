import { describe, expect, test } from "bun:test";
import { createHistory, formatHref, parseHref } from "engine/history";

describe("hrefs", () => {

    test("a href splits into a clean path and its query, and formats back", () => {

        expect(parseHref("/catalog/7?tab=info&tag=a&tag=b")).toEqual({ path: "/catalog/7", query: { tab: "info", tag: ["a", "b"] } });
        expect(parseHref("catalog//7/")).toEqual({ path: "/catalog/7", query: {} });
        expect(parseHref("app://catalog/7?x=1", "app")).toEqual({ path: "/catalog/7", query: { x: "1" } });
        expect(parseHref("https://shop.test/a/b?q=%D9%85", "app")).toEqual({ path: "/a/b", query: { q: "م" } });
        expect(formatHref({ path: "/catalog/7", query: { tab: "info", tag: ["a", "b"] } })).toBe("/catalog/7?tab=info&tag=a&tag=b");
        expect(formatHref({ path: "/", query: {} })).toBe("/");

    });

});
describe("history", () => {

    test("push stacks, back pops, and the root is never popped", () => {

        const history = createHistory("/");

        history.push("/catalog/1");
        history.push("/catalog/2");
        expect(history.entries().map(( entry ) => entry.path)).toEqual(["/", "/catalog/1", "/catalog/2"]);
        expect(history.back()).toBe(true);
        expect(history.back()).toBe(true);
        expect(history.back()).toBe(false);
        expect(history.current().path).toBe("/");
        expect(history.canGoBack()).toBe(false);

    });
    test("navigate returns to an entry already on the stack instead of stacking it twice", () => {

        const history = createHistory("/");

        history.push("/account");
        history.push("/catalog/3");
        history.navigate("/account");
        expect(history.entries().map(( entry ) => entry.path)).toEqual(["/", "/account"]);
        history.navigate("/settings");
        expect(history.entries().map(( entry ) => entry.path)).toEqual(["/", "/account", "/settings"]);

    });
    test("replace swaps the top, reset starts over, and query updates keep the entry", () => {

        const history = createHistory("/login");
        const first = history.current().key;

        history.replace("/");
        expect(history.entries().map(( entry ) => entry.path)).toEqual(["/"]);
        expect(history.current().key).not.toBe(first);

        history.push("/catalog/1");

        const key = history.current().key;

        history.setQuery({ tab: "info" });
        expect(history.current()).toMatchObject({ key, path: "/catalog/1", query: { tab: "info" } });

        history.reset("/settings");
        expect(history.entries().map(( entry ) => entry.path)).toEqual(["/settings"]);

    });
    test("a tab switch swaps the root in place under the same key and drops what was stacked above it", () => {

        const history = createHistory("/");
        const root = history.current().key;
        let heard = 0;

        history.subscribe(() => { heard += 1; });
        history.push("/catalog/7");
        history.tab("/account?from=tab");

        expect(history.entries().map(( entry ) => entry.path)).toEqual(["/account"]);
        expect(history.current().key).toBe(root);
        expect(history.current().query).toEqual({ from: "tab" });

        history.tab("/account?from=tab");

        expect(heard).toBe(2);

    });
    test("listeners hear each change once and an unchanged navigation stays silent", () => {

        const history = createHistory("/");
        const heard: number[] = [];
        const off = history.subscribe(() => heard.push(history.entries().length));

        history.push("/a");
        history.navigate("/a");
        history.back();
        off();
        history.push("/b");
        expect(heard).toEqual([2, 1]);

    });
    test("a native dismissal removes exactly the dismissed entry and everything above it", () => {

        const history = createHistory("/");

        history.push("/a");
        history.push("/b");
        history.push("/c");
        history.dismissed(history.entries()[2]?.key ?? "");
        expect(history.entries().map(( entry ) => entry.path)).toEqual(["/", "/a"]);
        history.dismissed("unknown");
        expect(history.entries().map(( entry ) => entry.path)).toEqual(["/", "/a"]);

    });
    test("a guard holds a leaving entry until its owner lets the navigation proceed", () => {

        const history = createHistory("/");

        history.push("/edit");

        const held: (() => void)[] = [];
        const release = history.guard(history.current().key, ( proceed ) => {

            held.push(proceed);

        });

        expect(history.back()).toBe(true);
        expect(history.current().path).toBe("/edit");
        history.navigate("/");
        expect(history.current().path).toBe("/edit");
        expect(history.blocked(history.current().key)).toBe(true);
        held[0]?.();
        expect(history.current().path).toBe("/");
        release();
        history.push("/edit");
        expect(history.back()).toBe(true);
        expect(history.current().path).toBe("/");

    });
    test("the stack never grows past its limit; the oldest entries above the root go first", () => {

        const history = createHistory("/", { limit: 4 });

        for ( const path of ["/a", "/b", "/c", "/d", "/e"] ) history.push(path);

        expect(history.entries().map(( entry ) => entry.path)).toEqual(["/", "/c", "/d", "/e"]);

    });

});
