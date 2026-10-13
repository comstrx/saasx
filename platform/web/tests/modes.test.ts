import { describe, expect, test } from "bun:test";
import { catalogueFacts } from "@engine/spec";
import { featureFacts } from "@engine/tooling";
import { endpoints } from "../src/api/features/index.ts";
import { type SiteConfig, validateSpec } from "../src/lib/spec/surface.ts";
import { composeMessages, loadSpec, root } from "../tools/core/index.ts";

const [client, admin] = await Promise.all([loadSpec("client"), loadSpec("admin")]);
const facts = await featureFacts(`${root}/src/features`);
const catalogue = catalogueFacts(endpoints);
const messagesOf = ( folder: string ) => composeMessages(`${folder}/brand/messages`);
const sources = { client: await import("../specs/client/config/index.ts"), admin: await import("../specs/admin/config/index.ts") };
const schemas = { client: await import("../specs/client/schema/index.ts"), admin: await import("../specs/admin/schema/index.ts") };

type Variant = Partial<SiteConfig>;

function compile ( name: "client" | "admin", variant: Variant ) {
    const base = sources[name].default as SiteConfig;
    const folder = name === "client" ? client.folder : admin.folder;
    const config = { ...base, ...variant, contents: { ...base.contents, ...(variant.contents ?? {}) } };

    return validateSpec(name, config, schemas[name].default, messagesOf(folder), facts, catalogue);
}
describe("one surface, many modes, by values alone", () => {
    test("seo: the client site crawls, lists its screens and enumerates its entities", () => {
        const { config, schema } = compile("client", {});
        const listed = schema.screens.filter(( screen ) => screen.listed).map(( screen ) => screen.name);

        expect(config.content.seo.robots.allow).toEqual(["/"]);
        expect(listed).toEqual(["home", "catalog"]);
    });
    test("non-seo: empty robots and sitemap lists turn the admin panel dark to crawlers without a flag", () => {
        const { config, schema } = compile("admin", {});

        expect(config.content.seo.robots.allow).toEqual([]);
        expect(config.content.seo.sitemap).toEqual([]);
        expect(schema.screens.every(( screen ) => screen.listed === false)).toBe(true);
    });
    test("with backend: the contracts give every connection an address and the catalogue its operations", () => {
        const { config, schema } = compile("client", {});

        expect(config.api?.connections.primary?.baseUrl).toBe("http://127.0.0.1:8000/v1");
        expect(schema.operations).toEqual(expect.arrayContaining(["catalogs.list", "catalogs.view"]));
    });
    test("without backend: contracts null refuses every read until the schema stops reading", () => {
        expect(() => compile("client", { contracts: null })).toThrow("needs a backend");

        const quiet = { screens: [{ contents: { name: "home", path: "/", title: { key: "nav.home" }, description: { key: "home.description" } }, blocks: [{ options: {}, features: [{ name: "nav", heading: true }], blocks: [] }] }] };
        const base = sources.client.default as SiteConfig;
        const { config } = validateSpec("client", { ...base, contracts: null }, quiet, messagesOf(client.folder), facts, catalogue);

        expect(config.api).toBeNull();
    });
    test("single tenant: a declared tenant is pinned into the request context", () => {
        const { config } = compile("client", {});

        expect(config.api?.context.tenant).toBe("www.zainlak.com");
    });
    test("a cleartext production address compiles only when the contracts say insecure", () => {
        const base = sources.client.default as SiteConfig;
        const contracts = base.contracts && typeof base.contracts === "object" ? base.contracts : null;

        expect(contracts?.urls.production).toMatch(/^http:/);
        expect(() => compile("client", { contracts: contracts ? { ...contracts, options: { ...contracts.options, insecure: false } } : null })).toThrow("insecure");
        expect(() => compile("client", { contracts })).not.toThrow();
    });
    test("multi tenant: no declared tenant lets the request host name the tenant", () => {
        const base = sources.client.default as SiteConfig;
        const contracts = base.contracts && typeof base.contracts === "object" ? { ...base.contracts, options: { ...base.contracts.options, tenant: null } } : null;
        const { config } = compile("client", { contracts });

        expect(config.api?.context.tenant).toBeNull();
    });
});
