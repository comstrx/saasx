import "server-only";

import { notFound } from "next/navigation";
import { ApiError, transient } from "@/api/core/error";
import type { ResourceData } from "@/api/core/resource";
import { type Data, type EntityKind, entities } from "@/api/features";
import { read, readEntity, readPageSeo } from "@/api/workflow/server";
import type { Locale } from "@/lib/spec/languages";
import type { CompiledScreen } from "@/lib/spec/screens";
import { config, screens } from "@/lib/spec/server";
import { includes } from "@/lib/std/object";
import { entityId, entityParam, fillPattern, patternKeys } from "@/lib/std/route";
import { plainText } from "@/lib/std/text";
import { webUrl } from "@/lib/std/url";

export type Seo = ResourceData<"seo">;
export type Page = CompiledScreen & { pattern?: string; parameters?: Record<string, string> };
type Product = Data<"products", "view">;
export type Source = { data: Seo; product?: Product; path?: string; locales?: readonly string[] | null };
type Shown = { kind: EntityKind; parameter: string; types?: readonly string[] };

type Entity = {
    id: number;
    slug?: string | null;
    type?: string | null;
    locales?: string[] | null;
    name?: string | null;
    title?: string | null;
    description?: string | null;
    content?: string | null;
    overview?: string | null;
    image?: string | null;
    image_width?: number | null;
    image_height?: number | null;
    image_alt?: string | null;
    attachments?: { type?: string | null; url?: string | null }[] | null;
    created_at?: string | null;
    updated_at?: string | null;
};

function summary ( value: string | null | undefined ): string | null {

    return plainText(value).slice(0, 300) || null;

}
function written ( data: Seo, locale: Locale ): Seo {

    if ( !data.locales || includes(data.locales, locale) ) return data;

    return { ...data, title: null, description: null, keywords: null, image_alt: null };

}
async function remote ( page: Page, locale: Locale ): Promise<Seo> {

    const fallback = config.contract.values.seo;

    if ( !page.options.seo || !config.contract.features.seo?.read?.enabled ) return fallback;

    try {

        return written(await readPageSeo(page.name), locale);

    }
    catch {

        return fallback;

    }

}
async function entity ( kind: EntityKind, id: number ) {

    try {

        return await readEntity(kind, id);

    }
    catch ( error ) {

        if ( error instanceof ApiError && error.status === 404 ) notFound();

        if ( transient(error) ) return null;

        throw error;

    }

}
function pictured ( data: Seo, item: Entity ): Partial<Seo> {

    const cover = item.attachments?.find(( file ) => file.type === "image")?.url;
    const url = webUrl(item.image || cover);

    if ( !url ) return {};

    return {
        image: url,
        image_width: item.image_width ?? null,
        image_height: item.image_height ?? null,
        image_alt: item.image_alt || plainText(item.title || item.name) || data.image_alt,
    };

}
function described ( data: Seo, item: Entity, article: boolean ): Seo {

    return {
        ...data,
        ...pictured(data, item),
        title: plainText(item.title || item.name) || data.title,
        description: summary(item.description || item.content || item.overview) ?? data.description,
        og_type: article ? "article" : data.og_type,
        published_at: article ? item.created_at ?? data.published_at : data.published_at,
        modified_at: item.updated_at ?? data.modified_at,
    };

}
export function shownEntity ( screen: CompiledScreen ): Shown | undefined {

    if ( !screen.entity ) return undefined;
    if ( typeof screen.entity === "string" ) return { kind: screen.entity, parameter: entities[screen.entity].parameter };

    const { kind, parameter = entities[screen.entity.kind].parameter, types } = screen.entity;

    return { kind, parameter, ...(types ? { types } : {}) };

}
export function entityPage ( kind: EntityKind, type: string | null | undefined ): CompiledScreen | undefined {

    const candidates = screens.flatMap(( screen ) => {

        const shown = shownEntity(screen);
        const keys = patternKeys(screen.path);

        return shown && shown.kind === kind && keys.length === 1 && keys[0] === shown.parameter ? [{ screen, shown }] : [];

    });

    return (candidates.find(( { shown } ) => includes(shown.types ?? [], type)) ?? candidates.find(( { shown } ) => !shown.types))?.screen;

}
export function entityPath ( screen: CompiledScreen, item: { id: number; slug?: string | null } ): string {

    const parameter = shownEntity(screen)?.parameter ?? "id";

    return fillPattern(screen.path, { [parameter]: entityParam(item.id, item.slug) });

}
async function slugged ( value: string | undefined ): Promise<number | undefined> {

    if ( !value || !/^[a-z][a-z0-9-]{0,199}$/.test(value) ) return undefined;

    return read("products", "slug", { slug: value }).then(( reply ) => reply.resource.id, () => undefined);

}
export async function source ( page: Page, locale: Locale ): Promise<Source> {

    const shown = shownEntity(page);

    if ( !shown ) return { data: await remote(page, locale) };

    const raw = page.parameters?.[shown.parameter];
    const id = entityId(raw) ?? (shown.kind === "product" ? await slugged(raw) : undefined);

    if ( !id ) notFound();

    const [data, item] = await Promise.all([remote(page, locale), entity(shown.kind, id)]);
    if ( !item ) return { data };

    const home = entityPage(shown.kind, "type" in item ? item.type : undefined);

    return {
        data: described(data, item, entities[shown.kind].article),
        product: "capabilities" in item ? item : undefined,
        path: home
            ? entityPath(home, item)
            : fillPattern(page.pattern ?? page.path, { ...page.parameters, [shown.parameter]: entityParam(item.id, item.slug) }),
        locales: item.locales ?? null,
    };

}
