import "server-only";

import packed from "@spec/config";
import messages from "@spec/messages";
import schema from "@spec/schema";
import { unpackContract } from "@/api/core/pack";
import { isSpecKey, type Localized, type SpecText } from "@/lib/spec/fields";
import type { Locale } from "@/lib/spec/languages";
import type { CompiledBlock, CompiledFeature, CompiledScreen } from "@/lib/spec/screens";
import { messageAt } from "@/lib/std/messages";
import { isRecord, mapValues } from "@/lib/std/object";
import { matchPath } from "@/lib/std/route";

type Placement = { screen: CompiledScreen; options: Record<string, unknown> };

export { messages };

export const config = { ...packed, contract: unpackContract(packed.contract) };

export const indexable = process.env.NODE_ENV === "production" && config.content.seo.indexable;
export const screens = schema.screens;
export const shell = schema.shell;

export function screenAt ( segments: readonly string[] = [] ) {

    const exact = screens.find(( screen ) => screen.path === `/${segments.join("/")}`);
    const candidates = exact ? [exact] : screens.filter(( screen ) => screen.path.includes(":"));

    for ( const screen of candidates ) {

        const parameters = matchPath(screen.path, segments);

        if ( parameters ) return { ...screen, pattern: screen.path, path: `/${segments.join("/")}`, parameters };

    }

    return undefined;

}
function placed (
    feature: string,
    screen: CompiledScreen,
    blocks: readonly CompiledBlock[],
    features: readonly CompiledFeature[],
): Placement[] {

    const own = features.flatMap(( entry ) => [
        ...(entry.name === feature ? [{ screen, options: entry.options }] : []),
        ...placed(feature, screen, entry.blocks, entry.features),
    ]);

    return [...own, ...blocks.flatMap(( block ) => placed(feature, screen, block.blocks, block.features))];

}
export function placements ( feature: string ): Placement[] {

    return screens.flatMap(( screen ) => placed(feature, screen, screen.blocks, []));

}
export function text ( value: SpecText, locale: Locale ): string {

    if ( typeof value === "string" ) return value;

    const result = messageAt(messages[locale], value.key);

    if ( result === undefined ) throw new Error(`Missing ${locale} message: ${value.key}`);

    return result;

}
function translate ( item: unknown, locale: Locale ): unknown {

    if ( isSpecKey(item) ) return text(item, locale);
    if ( Array.isArray(item) ) return item.map(( entry ) => translate(entry, locale));
    if ( isRecord(item) ) return mapValues(item, ( entry ) => translate(entry, locale));

    return item;

}
export function localize<T> ( value: T, locale: Locale ): Localized<T> {

    return translate(value, locale) as Localized<T>;

}
