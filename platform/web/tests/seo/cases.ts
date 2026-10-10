import type { SiteSchemaInput } from "../../src/lib/spec/screens.ts";
import { minimal } from "../core/project.ts";
import { answer, backend, mount, type Reply, refusal, type Sent, visit } from "../core/site.ts";

type Screen = SiteSchemaInput["screens"][number];
type Site = Awaited<ReturnType<typeof mount>>;

const config = { ...minimal, contents: { infos: { name: "Spec Site" }, seo: { indexable: true } } };
const written = ["en", "ar"];
const product = { name: "Stay", type: "hotel", description: "<p>Sea &amp; sand</p>", updated_at: "2026-02-01T00:00:00+00:00", locales: written };
const price = { amount: "99.50", currency: "USD", display: { amount: "373.13", currency: "SAR" } };
const geo = { address: "1 Nile St", zip_code: "11511", city: { name: "Cairo" }, country: { code: "EG" }, latitude: "30.04", longitude: "31.23" };
const features = [{ key: "star_rating", number: 5 }, { key: "pool", group: "amenities", label: "Pool" }, { key: "gym", group: "amenities", label: "Gym", included: false }];

type Contents = Screen["contents"];

function screen ( name: string, path: string, contents: Partial<Contents> = {}, options: Screen["options"] = {} ): Screen {

    return { contents: { name, path, title: `${name} title`, description: `${name} description`, ...contents }, options, blocks: [] };

}

export const screens: Screen[] = [
    screen("home", "/"),
    screen("about", "/about"),
    screen("team", "/about/team", {}, { seo: false }),
    screen("terms", "/terms"),
    screen("quiet", "/quiet", {}, { title: false }),
    screen("stay", "/stays/:productId", { entity: { kind: "product", types: ["hotel"] } }),
    screen("product", "/products/:productId", { entity: "product" }),
    screen("article", "/blog/:articleId", { entity: "article" }),
    screen("category", "/categories/:categoryId", { entity: "category" }, { index: false }),
    screen("place", "/places/:place", { entity: { kind: "geo", parameter: "place" } }),
    screen("host", "/hosts/:vendorId", { entity: "vendor" }),
    screen("post", "/news/first", { article: { publishedAt: "2026-01-02T03:04:05+00:00", author: "Writer" } }),
    screen("hidden", "/hidden", {}, { index: false }),
];
export const replies: Record<string, Reply> = {
    "/v1/content/site-info": answer({
        name: "Live Site",
        url: "https://www.example.test",
        logo: "https://cdn.example.test/logo.png",
        email: "care@example.test",
        phone: "+201000000000",
        address: "1 Nile St",
        geo: { city: { name: "Cairo" }, country: { name: "Egypt", code: "EG" } },
        socials: [{ key: "x", url: "https://x.com/site" }],
        timezone: "Asia/Riyadh",
        currency: "SAR",
        seo: { indexable: true, image: "https://cdn.example.test/share.png", twitter_site: "@site", verification: { google: "g-1", bing: "b-1" } },
    }),
    "/v1/locales": answer([{ id: 1, code: "en" }, { id: 2, code: "ar" }, { id: 3, code: "fr" }]),
    "/v1/currencies": answer([{ id: 1, code: "USD" }, { id: 2, code: "SAR" }, { id: 3, code: "EUR", allow_display: false }]),
    "/v1/contract": answer({ uploads: { max_bytes: 1048576 }, limits: { request_max_bytes: 4194304 }, password: { min: 8 } }),
    "/v1/content/seo/about": answer({
        title: "About us",
        description: "Who we are",
        keywords: ["about"],
        locales: ["en"],
        image: "https://cdn.example.test/about.png",
        image_width: 800,
        image_height: 400,
        created_at: "2026-03-01T00:00:00+00:00",
        updated_at: "2026-03-02T00:00:00+00:00",
        og_type: "article",
        authors: [{ name: "A", url: "https://a.example.test" }],
        breadcrumbs: [{ name: "Home", path: "/" }, { name: "About", path: "/about" }],
        noarchive: true,
        max_image_preview: "large",
        alternates: [{ language: "fr", href: "https://fr.example.test/about" }],
    }),
    "/v1/content/seo/terms": refusal(500),
    "/v1/content/seo/quiet": answer({ title: "Quiet title", description: "Quiet description" }),
    "/v1/catalogs/7": answer({ ...product, id: 7, slug: "grand-hotel", name: "Grand <b>Hotel</b>", capabilities: ["lodging", "bookable"], rating: "4.5", reviews: 12, geo, features, min_price: price, image: "https://cdn.example.test/h.jpg", image_width: 1200, image_height: 630, locales: ["en"] }),
    "/v1/catalogs/8": answer({ ...product, id: 8, slug: "nile-tour", type: "tour", capabilities: ["schedulable", "has_location", "bookable"], geo, min_price: "12" }),
    "/v1/catalogs/9": answer({ ...product, id: 9, slug: "derby", type: "ticket", subtype: "online", capabilities: ["perishable"], starts_at: "2026-10-01T18:00:00+00:00", stock: 0, min_price: price }),
    "/v1/catalogs/10": answer({ ...product, id: 10, slug: "camera", type: "goods", capabilities: ["purchasable"], sku: "CAM-1", min_price: price, features: { specs: [{ key: "brand", value: "Acme" }] } }),
    "/v1/catalogs/404": refusal(404),
    "/v1/blogs/3": answer({ id: 3, slug: "visa-guide", title: "Visa guide", content: "<h2>Before you fly</h2><p>Papers first.</p>", attachments: [{ type: "image", url: "https://cdn.example.test/cover.jpg" }], created_at: "2026-04-01T00:00:00+00:00", updated_at: "2026-04-02T00:00:00+00:00", locales: ["ar"] }),
    "/v1/categories/5": answer({ id: 5, slug: "shows", name: "Shows", description: "Matches and shows" }),
    "/v1/geos/11": answer({ id: 11, slug: "lotus-square", name: "Lotus Square", type: "district", overview: "A quiet square" }),
    "/v1/vendors/4": answer({ id: 4, slug: null, name: "Host" }),
    "/v1/content/sitemap?kind=catalogs&page=1": answer([{ id: 7, slug: "grand-hotel", type: "hotel", updated_at: "2026-02-01T00:00:00+00:00", image: "https://cdn.example.test/h.jpg", locales: ["en"] }, { id: 8, slug: "nile-tour", type: "tour" }], { page: 1, pages: 2 }),
    "/v1/content/sitemap?kind=catalogs&page=2": answer([{ id: 9, slug: "derby", type: "ticket" }], { page: 2, pages: 2 }),
    "/v1/content/sitemap?kind=blogs&page=1": answer([{ id: 3, slug: "visa-guide", locales: ["ar"] }]),
    "/v1/content/sitemap?kind=categories&page=1": answer([{ id: 5, slug: "shows" }]),
    "/v1/content/sitemap?kind=geos&page=1": refusal(500),
    "/v1/content/sitemap?kind=vendors&page=1": answer([{ id: 4, slug: null }]),
};

const views: [string, string][] = [
    ["en", ""], ["en", "about"], ["ar", "about"], ["en", "about/team"], ["en", "terms"], ["en", "quiet"],
    ["en", "stays/7-grand-hotel"], ["ar", "stays/7-grand-hotel"], ["en", "stays/7-old-slug"], ["en", "products/7-grand-hotel"],
    ["en", "products/8-nile-tour"], ["en", "products/9"], ["en", "products/10-camera"], ["en", "products/404-gone"], ["en", "products/abc"],
    ["en", "blog/3-visa-guide"], ["ar", "blog/3-visa-guide"], ["en", "categories/5-shows"], ["en", "places/11-lotus-square"],
    ["en", "hosts/4"], ["en", "news/first"], ["en", "hidden"],
];

function shared ( sent: Sent[] ): Sent[] {

    const lines = new Set(sent.map(( item ) => JSON.stringify(item)));

    return [...lines].sort().map(( line ): Sent => JSON.parse(line));

}
async function attempt ( run: () => unknown ): Promise<unknown> {

    try { return await run(); }
    catch ( error ) { return error instanceof Error ? { failed: error.message } : { failed: String(error) }; }

}
async function viewed ( site: Site, locale: string, path: string ): Promise<unknown> {

    const found = site.spec.screenAt(path ? path.split("/") : []);

    visit({ locale });

    return attempt(() => (found ? site.seo.pageSeo(found, locale === "ar" ? "ar" : "en") : "no page"));

}
async function files ( site: Site ): Promise<Record<string, unknown>> {

    const ids = await site.seo.generateSitemaps();
    const entries = await Promise.all(ids.map(async ( { id } ) => [id, await attempt(() => site.seo.sitemap({ id: Promise.resolve(id) }))]));

    return Object.fromEntries([...entries, ["missing", await attempt(() => site.seo.sitemap({ id: Promise.resolve("geo-9") }))]]);

}
async function settled ( site: Site ) {

    const sent = visit({ cookies: { "r.currency": "EUR" } });
    const settings = await site.server.siteSettings();
    const currency = await site.server.siteCurrency();
    const stay = await attempt(async () => (await site.server.readEntity("product", 7)).id);

    return { settings, currency, stay, sent: shared(sent) };

}
export async function record (): Promise<Record<string, unknown>> {

    const site = await mount(config, { screens });
    const result: Record<string, unknown> = {};

    backend(replies);

    for ( const [locale, path] of views ) {

        result[`${locale} /${path}`] = await viewed(site, locale, path);

    }

    visit();
    result.robots = await site.seo.robots();
    result.sitemaps = await files(site);
    result.site = await settled(site);

    backend({});
    visit();
    result["down /"] = await viewed(site, "en", "");
    result["down robots"] = await site.seo.robots();
    result["down sitemaps"] = await files(site);

    return result;

}
