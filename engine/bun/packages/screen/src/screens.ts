import { unique } from "engine/array";
import { matchPattern } from "engine/parse";
import type { Access, ShellPart } from "engine/spec";
import {
    type Localized,
    localizeTree,
    type Messages,
    type MessageText,
    messageText,
    type Routing,
    splitLocale,
} from "engine/translate";

export type Routed<S> = S & { pattern: string; parameters: Record<string, string> };
export type MenuItem = { name: string; path: string; title: MessageText; icon: string | null; access: Access };
export type Placed = { feature: string; options: Record<string, unknown> };
export type Runtime<S extends { path: string }, L extends string> = {
    screenAt: ( segments?: readonly string[] ) => Routed<S> | undefined;
    shellAt: ( screen: { options: Readonly<Record<string, unknown>> }, part: string, locale: L ) => Placed | null;
    text: ( value: MessageText, locale: L ) => string;
    localize: <T>( value: T, locale: L ) => Localized<T>;
};
export type RuntimeSpec<S extends { path: string }, L extends string> = {
    screens: readonly S[];
    shell: Readonly<Record<string, ShellPart>>;
    messages: Readonly<Record<L, Messages>>;
};

type MenuScreen = {
    name: string;
    path: string;
    title: MessageText;
    icon?: string | null | undefined;
    access: Access;
    options: Record<string, unknown>;
};

export function matchScreen<S extends { path: string }> ( screens: readonly S[], segments: readonly string[] ): Routed<S> | undefined {

    const path = `/${segments.join("/")}`;
    const exact = screens.find(( screen ) => screen.path === path);
    const candidates = exact ? [exact] : screens.filter(( screen ) => screen.path.includes(":"));

    for ( const screen of candidates ) {

        const parameters = matchPattern(screen.path, segments);

        if ( parameters ) return { ...screen, pattern: screen.path, path, parameters };

    }

    return undefined;

}
export function linkedFeatures (
    paths: Iterable<string>,
    screens: readonly { path: string; features: readonly string[] }[],
    routing: Routing,
): string[] {

    const opened = [...paths].map(( path ) => matchScreen(screens, splitLocale(path, routing).path.split("/").filter(Boolean)));

    return unique(opened.flatMap(( screen ) => screen?.features ?? []));

}
export function menuOf ( screens: readonly MenuScreen[], part: string ): MenuItem[] {

    return screens
        .filter(( screen ) => screen.options[part] === true && !screen.path.includes(":") && screen.access !== "guest")
        .map(({ name, path, title, icon, access }) => ({ name, path, title, icon: icon ?? null, access }));

}
export function defineRuntime<S extends { path: string }, L extends string> ( spec: RuntimeSpec<S, L> ): Runtime<S, L> {

    const { screens, shell, messages } = spec;

    return {
        screenAt: ( segments = [] ) => matchScreen(screens, segments),
        shellAt: ( screen, part, locale ) => {

            const placed = shell[part];

            if ( !placed?.feature || !screen.options[part] ) return null;

            return { feature: placed.feature, options: localizeTree(placed.options, messages[locale], locale) };

        },
        text: ( value, locale ) => messageText(value, messages[locale], locale),
        localize: ( value, locale ) => localizeTree(value, messages[locale], locale),
    };

}
