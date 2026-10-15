import { describe, expect, test } from "bun:test";
import { catalogueFacts } from "engine/spec";
import { featureFacts } from "engine/tooling";
import { endpoints } from "../src/api/features/index.ts";
import { block, feature, param, read, type SiteConfig, screen, t, validateSpec } from "../src/lib/spec/surface.ts";
import { composeMessages, installedSpecs, root } from "../tools/core/index.ts";

const [identity = ""] = installedSpecs();
const folder = `${root}/specs/${identity}`;
const base = ((await import(`${folder}/config/index.ts`)) as { default: SiteConfig }).default;
const messages = composeMessages(`${folder}/brand/messages`);
const facts = await featureFacts(`${root}/src/features`);
const catalogue = catalogueFacts(endpoints);
const backend = {
    urls: { production: "http://127.0.0.1:8000", local: "http://127.0.0.1:8000", browser: "http://127.0.0.1:8000" },
    options: { prefix: "v1", tenant: "tenant.example.test", proxies: 0, insecure: true },
    realtime: null,
};
const home = screen({
    contents: { name: "home", path: "/", title: t("nav.home"), description: t("home.description") },
    blocks: [block({}, [feature("catalogue", { heading: true, options: { title: t("catalogue.title"), empty: t("catalogue.empty"), from: t("catalogue.from"), columns: 3 }, ports: { items: read("catalogs.list", { limit: 12 }) } })])],
});
const catalog = screen({
    contents: { name: "catalog", path: "/catalog/:id", title: t("catalog.title"), description: t("catalog.description"), entity: "catalog" },
    blocks: [block({}, [feature("detail", { heading: true, options: { from: t("catalogue.from"), missing: t("state.missing"), back: t("catalog.back") }, ports: { item: read("catalogs.view", { id: param("id") }) } })])],
});
const quiet = screen({
    contents: { name: "home", path: "/", title: t("nav.home"), description: t("home.description") },
    blocks: [block({}, [feature("nav", { heading: true })])],
});

type Variant = Partial<SiteConfig>;

function compile ( variant: Variant, screens: readonly unknown[] = [home, catalog] ) {

    const config = { ...base, settings: { ...base.settings, delivery: "server", screen: { render: "server" } }, contracts: backend, ...variant, contents: { ...base.contents, ...(variant.contents ?? {}) } };

    return validateSpec(identity, config, { screens }, messages, facts, catalogue);

}
function crawlers ( allow: string[], sitemap: string[] ): Variant {

    return { contents: { ...base.contents, seo: { title: null, description: null, keywords: [], image: null, twitter: null, robots: { allow, disallow: allow.length ? [] : ["/"] }, sitemap, verification: {} } } };

}
describe("one surface, many modes, by values alone", () => {

    test("seo: an open robots list and a sitemap list the named screens for crawlers", () => {

        const { config, schema } = compile(crawlers(["/"], ["home", "catalog"]));

        expect(config.content.seo.robots.allow).toEqual(["/"]);
        expect(schema.screens.filter(( screen ) => screen.listed).map(( screen ) => screen.name)).toEqual(["home", "catalog"]);

    });
    test("non-seo: empty robots and sitemap lists turn the surface dark to crawlers without a flag", () => {

        const { config, schema } = compile(crawlers([], []));

        expect(config.content.seo.robots.allow).toEqual([]);
        expect(config.content.seo.sitemap).toEqual([]);
        expect(schema.screens.every(( screen ) => screen.listed === false)).toBe(true);

    });
    test("with backend: the contracts give every connection an address and the catalogue its operations", () => {

        const { config, schema } = compile({});

        expect(config.api?.connections.primary?.baseUrl).toBe("http://127.0.0.1:8000/v1");
        expect(schema.operations).toEqual(expect.arrayContaining(["catalogs.list", "catalogs.view"]));

    });
    test("without backend: contracts null refuses every read until the schema stops reading", () => {

        expect(() => compile({ contracts: null })).toThrow("needs a backend");
        expect(compile({ contracts: null }, [quiet]).config.api).toBeNull();

    });
    test("single tenant: a declared tenant is pinned into the request context", () => {

        expect(compile({}).config.api?.context.tenant).toBe("tenant.example.test");

    });
    test("a cleartext production address compiles only when the contracts say insecure", () => {

        expect(() => compile({ contracts: { ...backend, options: { ...backend.options, insecure: false } } })).toThrow("insecure");
        expect(() => compile({})).not.toThrow();

    });
    test("multi tenant: no declared tenant lets the request host name the tenant", () => {

        expect(compile({ contracts: { ...backend, options: { ...backend.options, tenant: null } } }).config.api?.context.tenant).toBeNull();

    });

});
