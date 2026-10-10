import assert from "node:assert/strict";
import { before, test } from "node:test";
import { resourceDefaults } from "../../src/api/core/resource.ts";
import type { SiteConfig } from "../../src/lib/spec/contract.ts";
import { themeDefaults } from "../../src/lib/spec/defaults.ts";
import type { SiteSchemaInput } from "../../src/lib/spec/screens.ts";
import { resolvePalette } from "../../tools/compile/theme.ts";
import { mount, visit } from "../core/site.ts";

type Site = Awaited<ReturnType<typeof mount>>;

const config = {
    contents: {
        infos: { name: "Spec Site", tagline: "Runs alone", description: "A site with no backend at all" },
        urls: { url: "https://spec.example.test" },
        contacts: { email: "care@spec.example.test" },
        seo: { title: "Spec title", description: "Spec description", indexable: true, twitter_site: "@spec", verification_google: "g-spec" },
    },
    settings: {
        locale: { default: "ar", enabled: ["ar", "en"], timeZone: "Asia/Riyadh" },
        currency: { default: "SAR", enabled: ["SAR", "USD"] },
        theme: { default: "dark", enabled: ["dark", "light"] },
        motion: "reduced",
        density: "compact",
        maintenance: true,
        maintenanceMessage: "Back soon",
    },
    themes: { colors: { light: { body: "#111111" } } },
    contracts: {
        urls: { production: null, local: null },
        options: { spec: "client", prefix: "v1", proxies: 0 },
    },
} satisfies SiteConfig;
const screens = [
    { contents: { name: "home", path: "/", title: "Home", description: "Start" }, blocks: [] },
    { contents: { name: "about", path: "/about", title: { key: "greeting" }, description: "About" }, blocks: [] },
] satisfies SiteSchemaInput["screens"];

let site: Site;
let logged: string[];

function quiet<T> ( run: () => Promise<T> ): Promise<T> {

    const { error, warn } = console;

    logged = [];
    console.error = ( line: string ) => { logged.push(line); };
    console.warn = ( line: string ) => { logged.push(line); };

    return run().finally(() => { Object.assign(console, { error, warn }); });

}
before(async () => {

    site = await mount(config, { screens });

});
test("every site document comes from the spec, nothing is fetched and nothing is logged", async () => {

    const sent = visit();
    const values = site.spec.config.contract.values;
    const [settings, currency, content, policy] = await quiet(() => Promise.all([
        site.server.siteSettings(), site.server.siteCurrency(), site.server.readContent(), site.server.readPolicy(),
    ]));

    assert.deepEqual(sent, []);
    assert.deepEqual(logged, []);
    assert.deepEqual(settings, {
        locale: { default: "ar", enabled: ["ar", "en"], timeZone: "Asia/Riyadh" },
        currency: { default: "SAR", enabled: ["SAR", "USD"] },
        theme: { default: "dark", enabled: ["dark", "light"] },
        motion: "reduced",
        density: "compact",
        maintenance: true,
        maintenanceMessage: "Back soon",
    });
    assert.equal(currency, "SAR");
    assert.deepEqual(content, values.content);
    assert.equal(content.name, "Spec Site");
    assert.equal(content.email, "care@spec.example.test");
    assert.deepEqual(policy, resourceDefaults("policy"));
    assert.deepEqual(values.seo, { ...resourceDefaults("seo"), title: "Spec title", description: "Spec description", indexable: true, twitter_site: "@spec", verification_google: "g-spec" });

});
test("a saved preference is honoured only inside the spec's choices", async () => {

    visit({ cookies: { "r.currency": "USD" } });
    assert.equal(await site.server.siteCurrency(), "USD");

    visit({ cookies: { "r.currency": "EGP" } });
    assert.equal(await site.server.siteCurrency(), "SAR");

});
test("the metadata, the graph, robots and the sitemap are written from the spec alone", async () => {

    const sent = visit({ locale: "ar" });
    const [first, second] = site.spec.screens;

    if ( !first || !second ) throw new Error("two screens");

    const seo = await quiet(() => site.seo.pageSeo(first, "ar"));
    const fallback = await quiet(() => site.seo.pageSeo(second, "en"));
    const robots = await site.seo.robots();
    const files = await site.seo.generateSitemaps();
    const listed = await site.seo.sitemap({ id: Promise.resolve("pages") });

    assert.deepEqual(sent, []);
    assert.deepEqual(logged, []);
    assert.equal(seo.metadata.title, "Spec title | Spec Site");
    assert.equal(seo.metadata.description, "Spec description");
    assert.equal(seo.url, "https://spec.example.test/");
    assert.deepEqual(seo.metadata.alternates, { canonical: "https://spec.example.test/", languages: { ar: "https://spec.example.test/", en: "https://spec.example.test/en", "x-default": "https://spec.example.test/" } });
    assert.deepEqual(Object.entries(seo.metadata.robots ?? {}).filter(( [, value] ) => value !== undefined), [["index", true], ["follow", true]]);
    assert.equal(seo.metadata.twitter?.site, "@spec");
    assert.deepEqual(seo.metadata.verification, { google: "g-spec", yandex: undefined });
    assert.equal(fallback.metadata.title, "Spec title | Spec Site");
    assert.equal(fallback.url, "https://spec.example.test/en/about");
    assert.deepEqual(robots, { rules: { userAgent: "*", allow: "/" }, sitemap: ["https://spec.example.test/sitemap/pages.xml"], host: "https://spec.example.test" });
    assert.deepEqual(files, [{ id: "pages" }]);
    assert.deepEqual(listed.map(( entry ) => entry.url).sort(), ["https://spec.example.test/", "https://spec.example.test/about", "https://spec.example.test/en", "https://spec.example.test/en/about"]);

});
test("a site that faces clients directly ignores every forwarded header", async () => {

    const request = await import("../../src/lib/site/request.ts");

    visit({ headers: { host: "Spec.Example.test:8443", "x-forwarded-host": "evil.example", "x-forwarded-for": "203.0.113.9", "x-forwarded-proto": "https" } });

    assert.equal(await request.requestHost(), "Spec.Example.test:8443");
    assert.equal(await request.requestClient(), undefined);
    assert.equal(await request.requestOrigin(), "https://spec.example.test");

});
test("the theme colours and the viewport come from the spec merged over the core defaults", () => {

    const { colors } = site.spec.config.theme;
    const defaults = resolvePalette(themeDefaults.colors);

    assert.equal(colors.light.body, "#111111");
    assert.equal(colors.light.primary, defaults.light.primary);
    assert.deepEqual(colors.dark, defaults.dark);
    assert.deepEqual(site.seo.siteViewport.themeColor, [
        { media: "(prefers-color-scheme: light)", color: "#111111" },
        { media: "(prefers-color-scheme: dark)", color: defaults.dark.body },
    ]);

});
