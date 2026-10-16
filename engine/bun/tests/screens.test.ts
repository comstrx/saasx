import { describe, expect, test } from "bun:test";
import { defineBoundary, defineRuntime, linkedFeatures, matchScreen, menuOf, placementOf } from "engine/screen";

describe("screens", () => {

    const screens = [
        { path: "/", name: "home" },
        { path: "/items/:id", name: "item" },
    ];

    test("paths match exactly first, then by pattern", () => {

        expect(matchScreen(screens, [])?.name).toBe("home");
        expect(matchScreen(screens, ["items", "7"])).toMatchObject({
            name: "item",
            path: "/items/7",
            pattern: "/items/:id",
            parameters: { id: "7" },
        });
        expect(matchScreen(screens, ["nope"])).toBeUndefined();

    });
    test("a menu lists the screens that show a shell part, reachable without parameters and not guest-only", () => {

        const screens = [
            {
                name: "home",
                path: "/",
                title: { key: "nav.home" },
                icon: "house",
                access: "any",
                options: { sidebar: true },
            },
            {
                name: "item",
                path: "/items/:id",
                title: { key: "nav.item" },
                icon: null,
                access: "any",
                options: { sidebar: true },
            },
            {
                name: "login",
                path: "/login",
                title: { key: "nav.login" },
                icon: null,
                access: "guest",
                options: { sidebar: true },
            },
            {
                name: "settings",
                path: "/settings",
                title: { key: "nav.settings" },
                access: "user",
                options: { sidebar: true },
            },
            {
                name: "about",
                path: "/about",
                title: { key: "nav.about" },
                icon: "info",
                access: "any",
                options: { sidebar: false },
            },
        ] as const;

        expect(menuOf(screens, "sidebar")).toEqual([
            { name: "home", path: "/", title: { key: "nav.home" }, icon: "house", access: "any" },
            { name: "settings", path: "/settings", title: { key: "nav.settings" }, icon: null, access: "user" },
        ]);
        expect(menuOf(screens, "footer")).toEqual([]);

    });
    test("a runtime answers screens, texts and shell parts from the compiled spec in every language", () => {

        const runtime = defineRuntime({
            screens: [{ path: "/", name: "home" }, { path: "/items/:id", name: "item" }],
            shell: { nav: { feature: "menu", options: { title: { key: "nav.home" } } }, footer: { feature: null, options: {} } },
            messages: { en: { nav: { home: "Home" } }, ar: { nav: { home: "الرئيسية" } } },
        });

        expect(runtime.screenAt(["items", "3"])?.parameters).toEqual({ id: "3" });
        expect(runtime.screenAt()?.name).toBe("home");
        expect(runtime.text({ key: "nav.home" }, "ar")).toBe("الرئيسية");
        expect(runtime.localize({ label: { key: "nav.home" } }, "en")).toEqual({ label: "Home" });
        expect(runtime.shellAt({ options: { nav: true, footer: true } }, "nav", "ar")).toEqual({
            feature: "menu",
            options: { title: "الرئيسية" },
        });
        expect(runtime.shellAt({ options: { nav: false } }, "nav", "en")).toBeNull();
        expect(runtime.shellAt({ options: { footer: true } }, "footer", "en")).toBeNull();

    });

});
describe("linked features", () => {

    test("the links of a page name the features of the screens they open, once each, in any language", () => {

        const screens = [
            { path: "/", features: ["search", "catalogue"] },
            { path: "/login", features: ["login"] },
            { path: "/catalog/:id/edit", features: ["form", "catalogue"] },
        ];
        const routing = { locales: ["en", "ar"], defaultLocale: "en" };
        const paths = ["/login", "/ar/catalog/7/edit", "/missing", "/", "/ar/login"];

        expect(linkedFeatures(paths, screens, routing)).toEqual(["login", "form", "catalogue", "search"]);
        expect(linkedFeatures([], screens, routing)).toEqual([]);

    });

});
describe("render pieces", () => {

    test("a feature's placement is its id, slug, heading and access, nothing else", () => {

        const entry = { id: "home.f0", slug: "home-menu", heading: true, access: ["user"], name: "menu", owner: "client" };

        expect(placementOf(entry as never)).toEqual({ id: "home.f0", slug: "home-menu", heading: true, access: ["user"] });

    });
    test("a boundary reports what it caught under its name, shows the part's fallback and retries by resetting", () => {

        const reported: unknown[] = [];
        const Boundary = defineBoundary<{ message: string }>({
            report: ( name, error ) => reported.push([name, error]),
            fallback: ({ message, reset }) => ({ message, reset }) as never,
        });
        const Mounted = Boundary as unknown as new ( props: object ) => {
            state: { failed: boolean };
            props: object;
            setState: ( next: object ) => void;
            componentDidCatch: ( error: unknown ) => void;
            render: () => unknown;
        };
        const boundary = new Mounted({ name: "table", message: "Failed", children: "kids" });
        const failure = new Error("x");

        expect(boundary.render()).toBe("kids");
        boundary.componentDidCatch(failure);
        expect(reported).toEqual([["table", failure]]);

        const failed = Object.assign(boundary, { state: { failed: true } }).render() as { message: string; reset: () => void };

        expect(failed.message).toBe("Failed");

        let next: object | undefined;

        boundary.setState = ( value ) => { next = value; };
        failed.reset();
        expect(next).toEqual({ failed: false });
        expect((Boundary as unknown as { getDerivedStateFromError: () => object }).getDerivedStateFromError()).toEqual({ failed: true });

    });

});
