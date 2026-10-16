export type Direction = "ltr" | "rtl";
export type Routing = { locales: readonly string[]; defaultLocale: string };
export type Located = { locale: string; path: string; explicit: boolean };
export type Language = { label: string; direction: Direction; openGraph: string };

const rtl = ["ar", "he", "fa", "ur", "ps", "sd", "ug", "yi", "dv", "ku"];

function weighted ( part: string ): { tag: string; weight: number } {

    const [tag = "", ...parameters] = part.split(";").map(( piece ) => piece.trim());
    const quality = parameters.find(( parameter ) => parameter.startsWith("q="));

    return { tag: tag.toLowerCase(), weight: quality ? Number(quality.slice(2)) : 1 };

}
function ranked ( header: string | null | undefined ): string[] {

    return (header ?? "")
        .split(",")
        .map(weighted)
        .filter(( entry ) => entry.weight > 0 && /^[a-z]{1,8}(?:-[a-z0-9]{1,8})*$/.test(entry.tag))
        .sort(( a, b ) => b.weight - a.weight)
        .map(( entry ) => entry.tag);

}
export function directionOf ( locale: string ): Direction {

    return rtl.includes(locale.split("-")[0] ?? "") ? "rtl" : "ltr";

}
export function splitLocale ( pathname: string, routing: Routing ): Located {

    const [, first = "", ...rest] = pathname.split("/");

    if ( !routing.locales.includes(first) )
        return { locale: routing.defaultLocale, path: pathname || "/", explicit: false };

    return { locale: first, path: `/${rest.join("/")}`, explicit: true };

}
export function prefixed ( locale: string, path: string ): string {

    return path === "/" ? `/${locale}` : `/${locale}${path}`;

}
export function localePath ( locale: string, path: string, routing: Routing ): string {

    return locale === routing.defaultLocale ? path : prefixed(locale, path);

}
export function preferredPath (
    { path, explicit }: Located,
    preferred: string | undefined,
    routing: Routing,
): string | undefined {

    if ( explicit || !preferred || preferred === routing.defaultLocale ) return undefined;

    return routing.locales.includes(preferred) ? prefixed(preferred, path) : undefined;

}
export function negotiate ( header: string | null | undefined, locales: readonly string[] ): string | undefined {

    return ranked(header)
        .map(( tag ) => tag.split("-")[0] ?? "")
        .find(( language ) => locales.includes(language));

}
export function regionOf ( header: string | null | undefined ): string | undefined {

    for ( const tag of ranked(header) ) {

        const region = tag
            .split("-")
            .slice(1)
            .find(( part ) => /^[a-z]{2}$/.test(part));

        if ( region ) return region.toUpperCase();

    }

    return undefined;

}
export function isTimeZone ( value: string ): boolean {

    try {

        return new Intl.DateTimeFormat("en", { timeZone: value }).resolvedOptions().timeZone.length > 0;

    } catch {

        return false;

    }

}
const autonyms: Record<string, string> = {
    ar: "العربية",
    en: "English",
    fr: "Français",
    de: "Deutsch",
    es: "Español",
    it: "Italiano",
    pt: "Português",
    tr: "Türkçe",
    ru: "Русский",
    fa: "فارسی",
    ur: "اردو",
    hi: "हिन्दी",
    zh: "中文",
    ja: "日本語",
    ko: "한국어",
    nl: "Nederlands",
    sv: "Svenska",
    pl: "Polski",
    id: "Bahasa Indonesia",
    ms: "Bahasa Melayu",
};

const displays = new Map<string, Intl.DisplayNames | null>();

function display ( locale: string ): Intl.DisplayNames | null {

    if ( !Intl.DisplayNames ) return null;

    const known = displays.get(locale);

    if ( known !== undefined ) return known;

    let made: Intl.DisplayNames | null = null;

    try {

        made = new Intl.DisplayNames([locale], { type: "language" });

    } catch {

        made = null;

    }

    if ( displays.size >= 64 ) displays.clear();

    displays.set(locale, made);

    return made;

}
const named = new Map<string, string>();

function nameOf ( code: string, locale: string ): string {

    const base = code.split(/[-_]/)[0]?.toLowerCase() ?? code;

    try {

        return display(locale)?.of(code) ?? autonyms[base] ?? code;

    } catch {

        return autonyms[base] ?? code;

    }

}
export function languageName ( code: string, locale: string ): string {

    if ( !Intl.DisplayNames ) return nameOf(code, locale);

    const key = `${locale}|${code}`;
    const known = named.get(key);

    if ( known !== undefined ) return known;
    if ( named.size >= 512 ) named.clear();

    const name = nameOf(code, locale);

    named.set(key, name);

    return name;

}
export function languageFacts ( code: string ): Language {

    const [language = code, given] = code.split(/[-_]/);
    const region = given ?? likelyRegion(code) ?? language.toUpperCase();

    return {
        label: languageName(code, code),
        direction: directionOf(code),
        openGraph: `${language.toLowerCase()}_${region.toUpperCase()}`,
    };

}
export function languagesOf<L extends string> ( locales: readonly L[] ): Record<L, Language> {

    return Object.fromEntries(locales.map(( locale ) => [locale, languageFacts(locale)])) as Record<L, Language>;

}
function likelyRegion ( code: string ): string | undefined {

    const host = globalThis.Intl as {
        Locale?: new (tag: string) => { maximize: () => { region?: string | undefined } };
    };

    if ( !host.Locale ) return undefined;

    try {

        return new host.Locale(code).maximize().region;

    } catch {

        return undefined;

    }

}
