import "server-only";

import type { ResourceData } from "@/api/core/resource";
import { routing } from "@/lib/spec/config";
import type { Locale } from "@/lib/spec/languages";
import { indexable as siteIndexable, text } from "@/lib/spec/server";
import type { Json } from "@/lib/std/json";
import { localePath } from "@/lib/std/locale";
import { present } from "@/lib/std/object";
import { absolute, absoluteHref } from "@/lib/std/url";
import { productEntity } from "./product";
import type { Page, Seo, Source } from "./source";

export type Site = { origin: string; locales: readonly Locale[]; content: ResourceData<"content"> };
export type Image = { url: string; alt: string; width?: number; height?: number };
export type Fields = {
    site: Site;
    locale: Locale;
    locales: readonly Locale[];
    data: Seo;
    entity: Json;
    path: string;
    url: string;
    alternates: Record<string, string>;
    title: string;
    titled: boolean;
    crawled: boolean;
    description: string;
    keywords?: string[];
    indexable: boolean;
    follow: boolean;
    authors?: { name: string; url?: string }[];
    publishedAt?: string;
    modifiedAt?: string;
    article: boolean;
    images?: Image[];
    card: "summary" | "summary_large_image";
};

function home ( locales: readonly Locale[], locale: Locale ): Locale {

    if ( locales.includes(locale) ) return locale;

    return locales.includes(routing.defaultLocale) ? routing.defaultLocale : locales[0] ?? locale;

}
function picture ( data: Seo, site: Site, alt: string ): Image[] | undefined {

    const sized = data.image_width && data.image_height ? { width: data.image_width, height: data.image_height } : {};

    if ( data.image ) return [{ url: data.image, alt, ...sized }];

    const image = site.content.seo.image;

    return image ? [{ url: image, alt }] : undefined;

}
function authors ( data: Seo, page: Page, locale: Locale ): Fields["authors"] {

    const declared = page.article?.author;
    const author = data.author ?? (declared ? text(declared, locale) : undefined);

    if ( data.authors.length ) return data.authors.map(( value ) => present(value));

    return author ? [{ name: author }] : undefined;

}
export function images ( values: Seo["og_images"] ): Image[] {

    return values.map(( value ) => present(value));

}
export function writtenLocales ( site: Site, languages: readonly string[] | null | undefined ): Locale[] {

    const found = languages ? site.locales.filter(( locale ) => languages.includes(locale)) : [];

    return found.length ? found : [...site.locales];

}
export function pageUrl ( site: Site, locale: string, path: string ): string {

    return absolute(site.origin, localePath(locale, path, routing));

}
export function localeAlternates (
    site: Site,
    locales: readonly Locale[],
    path: string,
    listed: Seo["alternates"] = [],
): Record<string, string> {

    const own = locales.length > 1 ? locales.map(( locale ) => [locale, pageUrl(site, locale, path)]) : [];
    const fallback = own.length ? [["x-default", pageUrl(site, home(locales, routing.defaultLocale), path)]] : [];

    return Object.fromEntries([
        ...own,
        ...fallback,
        ...listed.map(( item ) => [item.language, absoluteHref(site.origin, item.href)]),
    ]);

}
export function resolveFields ( page: Page, locale: Locale, site: Site, source: Source ): Fields {

    const { data, product } = source;
    const { options } = page;
    const path = source.path ?? data.canonical ?? page.path;
    const locales = writtenLocales(site, source.locales);
    const url = pageUrl(site, home(locales, locale), path);
    const imageAlt = data.image_alt ?? site.content.name;
    const indexable = siteIndexable && site.content.seo.indexable !== false && options.seo && options.index && data.indexable !== false;

    return {
        site,
        locale,
        locales,
        data,
        entity: options.seo && product ? productEntity(product, url) : null,
        path,
        url,
        alternates: localeAlternates(site, locales, path, data.alternates),
        title: data.title ?? text(page.title, locale),
        titled: options.title,
        crawled: options.seo,
        description: data.description ?? text(page.description, locale),
        keywords: data.keywords ?? undefined,
        indexable,
        follow: data.follow !== false && indexable,
        authors: authors(data, page, locale),
        publishedAt: data.published_at ?? page.article?.publishedAt,
        modifiedAt: data.modified_at ?? page.article?.modifiedAt,
        article: data.og_type === "article" || (data.og_type === null && !!page.article),
        images: data.og_images.length ? images(data.og_images) : picture(data, site, imageAlt),
        card: data.twitter_card ?? "summary_large_image",
    };

}
