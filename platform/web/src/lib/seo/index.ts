import "server-only";

import type { Metadata, MetadataRoute, Viewport } from "next";
import { PHASE_PRODUCTION_BUILD } from "next/constants.js";
import { cache } from "react";
import { type Data, type EntityKind, entities, entityKinds } from "@/api/features";
import { readContent, readSitemap, siteSettings } from "@/api/workflow/server";
import { getLocale } from "@/lib/providers/intl-server";
import { requestOrigin } from "@/lib/site/request";
import type { Locale } from "@/lib/spec/languages";
import { config, indexable, screens } from "@/lib/spec/server";
import { includes } from "@/lib/std/object";
import { patternKeys } from "@/lib/std/route";
import { absolute, parseUrl } from "@/lib/std/url";
import { localeAlternates, pageUrl, resolveFields, type Site, writtenLocales } from "./fields";
import { toGraph } from "./graph";
import { toMetadata } from "./metadata";
import { entityPage, entityPath, type Page, shownEntity, source } from "./source";

type Listing = {
    path: string;
    locales: readonly Locale[];
    alternates: Record<string, string>;
    modifiedAt?: string | null;
    image?: string | null;
};
type Row = Data<"sitemap", "list">;

function listed ( site: Site, { path, locales, alternates, modifiedAt, image }: Listing ): MetadataRoute.Sitemap {

    return locales.map(( locale ) => ({
        url: pageUrl(site, locale, path),
        ...(modifiedAt ? { lastModified: modifiedAt } : {}),
        ...(image ? { images: [image] } : {}),
        ...(Object.keys(alternates).length ? { alternates: { languages: alternates } } : {}),
    }));

}
function feedListings ( site: Site, kind: EntityKind, rows: readonly Row[] ): Listing[] {

    return rows.flatMap(( row ) => {

        const page = entityPage(kind, row.type);

        if ( !page?.options.seo || !page.options.index ) return [];

        const path = entityPath(page, row);
        const locales = writtenLocales(site, row.locales);

        return [{ path, locales, alternates: localeAlternates(site, locales, path), modifiedAt: row.updated_at, image: row.image }];

    });

}

export const siteIdentity = cache(async (): Promise<Site> => {

    const [content, settings] = await Promise.all([readContent(), siteSettings()]);
    const origin = (content.url ? parseUrl(content.url)?.origin : undefined) ?? await requestOrigin();

    return { origin, content, locales: settings.locale.enabled };

});
export const siteViewport: Viewport = {
    width: "device-width",
    initialScale: 1,
    themeColor: (["light", "dark"] as const).map(( scheme ) => ({
        media: `(prefers-color-scheme: ${scheme})`,
        color: config.theme.colors[scheme].body,
    })),
};
export const pageSeo = cache(async ( page: Page, locale: Locale ) => {

    const [site, found] = await Promise.all([siteIdentity(), source(page, locale)]);
    const fields = resolveFields(page, locale, site, found);

    return {
        metadata: toMetadata(fields),
        structuredData: fields.crawled ? toGraph(fields) : undefined,
        path: fields.path,
        url: fields.url,
        locales: fields.locales,
        alternates: fields.alternates,
        indexable: fields.indexable,
        modifiedAt: fields.modifiedAt,
        redirect: found.path && found.path !== page.path ? found.path : undefined,
    };

});

export async function siteMetadata (): Promise<Metadata> {

    const { origin, content } = await siteIdentity();

    return {
        metadataBase: new URL(origin),
        applicationName: content.name || undefined,
        icons: {
            ...(content.icon ? { icon: [{ url: content.icon }] } : {}),
            ...(content.apple_icon ? { apple: [{ url: content.apple_icon }] } : {}),
        },
    };

}
async function indexed (): Promise<Site | undefined> {

    const site = indexable ? await siteIdentity() : undefined;

    return site?.content.seo.indexable === false ? undefined : site;

}
async function fixedListings (): Promise<Listing[]> {

    const locale = await getLocale();
    const fixed = screens.filter(( page ) => !patternKeys(page.path).length);
    const found = await Promise.all(fixed.map(( page ) => pageSeo(page, locale).catch(() => undefined)));

    return found.flatMap(( entry ) => (entry?.indexable ? [entry] : []));

}
async function feedPages ( kind: EntityKind ): Promise<{ id: string }[]> {

    const { pages: total } = await readSitemap(entities[kind].feed, 1).catch(() => ({ pages: 0 }));

    return Array.from({ length: total }, ( _, index ) => ({ id: `${kind}-${index + 1}` }));

}
async function feedListing ( site: Site, id: string ): Promise<Listing[]> {

    const [, kind = "", page = ""] = /^([a-z]+)-(\d+)$/.exec(id) ?? [];

    if ( !includes(entityKinds, kind) ) return [];

    const { rows } = await readSitemap(entities[kind].feed, Number(page)).catch(() => ({ rows: [] }));

    return feedListings(site, kind, rows);

}
export async function generateSitemaps (): Promise<{ id: string }[]> {

    if ( process.env.NEXT_PHASE === PHASE_PRODUCTION_BUILD || !await indexed() ) return [];

    const kinds = entityKinds.filter(( kind ) => screens.some(( page ) => shownEntity(page)?.kind === kind));
    const feeds = await Promise.all(kinds.map(feedPages));

    return [{ id: "pages" }, ...feeds.flat()];

}
export async function sitemap ( { id }: { id: Promise<string> } ): Promise<MetadataRoute.Sitemap> {

    const [site, name] = await Promise.all([indexed(), id]);

    if ( !site ) return [];

    const listings = name === "pages" ? await fixedListings() : await feedListing(site, name);

    return listings.flatMap(( entry ) => listed(site, entry)).slice(0, 50000);

}
export async function robots (): Promise<MetadataRoute.Robots> {

    const { origin } = await siteIdentity();
    const files = await generateSitemaps();

    return {
        rules: { userAgent: "*", ...(files.length ? { allow: "/" } : { disallow: "/" }) },
        sitemap: files.map(( file ) => absolute(origin, `/sitemap/${file.id}.xml`)),
        host: origin,
    };

}
