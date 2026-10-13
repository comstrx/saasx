import "server-only";

import { rows } from "@engine/spec";
import { localePath } from "@engine/translate";
import type { Metadata, MetadataRoute } from "next";
import { entities, type Feature, type OperationOf } from "@/api/features";
import { read } from "@/api/workflow/server";
import type { Locale } from "@/lib/spec/languages";
import { languages } from "@/lib/spec/languages";
import type { Matched } from "@/lib/spec/server";
import { config, crawlable, routing, screens, text } from "@/lib/spec/server";

type Page = Pick<Matched, "title" | "description" | "options" | "path" | "listed">;

function absolute ( path: string ): string | undefined {

    return config.content.url ? `${config.content.url}${path}` : undefined;

}
function alternates ( path: string ): NonNullable<Metadata["alternates"]> | undefined {

    if ( !config.content.url ) return undefined;

    const languageLinks = Object.fromEntries(routing.locales.map(( locale ) => [locale, absolute(localePath(locale, path, routing))]));

    return { canonical: absolute(localePath(routing.defaultLocale, path, routing)), languages: { ...languageLinks, "x-default": absolute(path) } };

}
export function pageMetadata ( screen: Page, locale: Locale ): Metadata {

    const site = config.content.name;
    const title = text(screen.title, locale);
    const description = text(screen.description, locale);
    const listed = crawlable && screen.listed;

    return {
        title: screen.options.title ? `${title} · ${site}` : site,
        description: crawlable ? description : undefined,
        robots: { index: listed, follow: listed },
        alternates: crawlable ? alternates(screen.path) : undefined,
        openGraph: crawlable ? { title, description, siteName: site, locale: languages[locale].openGraph, type: "website", url: absolute(screen.path) } : undefined,
    };

}
export function siteMetadata (): Metadata {

    const { content } = config;

    return {
        metadataBase: content.url ? new URL(content.url) : undefined,
        title: content.name,
        description: content.seo.description ?? content.description ?? undefined,
        applicationName: content.name,
        icons: content.icon ? { icon: content.icon } : undefined,
        verification: Object.keys(content.seo.verification).length ? { other: content.seo.verification } : undefined,
    };

}
export function robots (): MetadataRoute.Robots {

    const { allow, disallow } = config.content.seo.robots;
    const sitemap = absolute("/sitemap.xml");
    const rules = allow.length || disallow.length ? { userAgent: "*", ...(allow.length ? { allow } : {}), ...(disallow.length ? { disallow } : {}) } : { userAgent: "*", disallow: "/" };

    return { rules, ...(crawlable && config.content.seo.sitemap.length && sitemap ? { sitemap } : {}) };

}
const pageSize = 50;
const pageLimit = 20;

function entry ( path: string ): MetadataRoute.Sitemap[number] {

    return {
        url: absolute(path) ?? path,
        alternates: { languages: Object.fromEntries(routing.locales.map(( locale ) => [locale, absolute(localePath(locale, path, routing)) ?? path])) },
    };

}
function ids ( result: { resource: unknown } | undefined, parameter: string ): string[] {

    return rows(result?.resource).flatMap(( row ) => (row[parameter] === undefined ? [] : [String(row[parameter])]));

}
async function members ( kind: string, parameter: string ): Promise<string[]> {

    const source = entities[kind as keyof typeof entities] as { parameter: string; list?: string | undefined } | undefined;
    const [feature, operation] = (source?.list ?? "").split(".") as [Feature, OperationOf<Feature>];

    if ( !source?.list ) return [];

    const load = ( page: number ) => read(feature, operation, { page, limit: pageSize } as never).catch(() => undefined);
    const first = await load(1);
    const pages = Math.min(pageLimit, first?.meta.pagination?.pages ?? 1);
    const rest = await Promise.all(Array.from({ length: Math.max(0, pages - 1) }, ( _, index ) => load(index + 2)));

    return [first, ...rest].flatMap(( result ) => ids(result, parameter));

}
export async function sitemap (): Promise<MetadataRoute.Sitemap> {

    if ( !crawlable || !config.content.url ) return [];

    const listed = screens.filter(( screen ) => screen.listed && screen.access === "any");
    const plain = listed.filter(( screen ) => !screen.path.includes(":")).map(( screen ) => entry(screen.path));
    const owned = await Promise.all(listed.filter(( screen ) => screen.entity && screen.path.includes(":")).map(async ( screen ) => {

        const parameter = screen.path.split("/").find(( part ) => part.startsWith(":"))?.slice(1) ?? "id";
        const kind = typeof screen.entity === "string" ? screen.entity : screen.entity?.kind ?? "";

        return (await members(kind, parameter)).map(( id ) => entry(screen.path.replace(`:${parameter}`, id)));

    }));

    return [...plain, ...owned.flat()];

}
