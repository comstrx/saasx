
export type Routing = { locales: readonly string[]; defaultLocale: string };
export type Located = { locale: string; path: string; explicit: boolean };

function weighted ( part: string ): { tag: string; weight: number } {

    const [tag = "", ...parameters] = part.split(";").map(( piece ) => piece.trim());
    const quality = parameters.find(( parameter ) => parameter.startsWith("q="));

    return { tag: tag.toLowerCase(), weight: quality ? Number(quality.slice(2)) : 1 };

}
function ranked ( header: string | null | undefined ): string[] {

    return (header ?? "").split(",")
        .map(weighted)
        .filter(( entry ) => entry.weight > 0 && /^[a-z]{1,8}(?:-[a-z0-9]{1,8})*$/.test(entry.tag))
        .sort(( a, b ) => b.weight - a.weight)
        .map(( entry ) => entry.tag);

}
export function splitLocale ( pathname: string, routing: Routing ): Located {

    const [, first = "", ...rest] = pathname.split("/");

    if ( !routing.locales.includes(first) ) return { locale: routing.defaultLocale, path: pathname || "/", explicit: false };

    return { locale: first, path: `/${rest.join("/")}`, explicit: true };

}
export function prefixed ( locale: string, path: string ): string {

    return path === "/" ? `/${locale}` : `/${locale}${path}`;

}
export function localePath ( locale: string, path: string, routing: Routing ): string {

    return locale === routing.defaultLocale ? path : prefixed(locale, path);

}
export function preferredPath ( { path, explicit }: Located, preferred: string | undefined, routing: Routing ): string | undefined {

    if ( explicit || !preferred || preferred === routing.defaultLocale ) return undefined;

    return routing.locales.includes(preferred) ? prefixed(preferred, path) : undefined;

}
export function negotiate ( header: string | null | undefined, locales: readonly string[] ): string | undefined {

    return ranked(header).map(( tag ) => tag.split("-")[0] ?? "").find(( language ) => locales.includes(language));

}
export function regionOf ( header: string | null | undefined ): string | undefined {

    for ( const tag of ranked(header) ) {

        const region = tag.split("-").slice(1).find(( part ) => /^[a-z]{2}$/.test(part));

        if ( region ) return region.toUpperCase();

    }

    return undefined;

}
export function isTimeZone ( value: string ): boolean {

    try {

        new Intl.DateTimeFormat("en", { timeZone: value });
        return true;

    }
    catch {

        return false;

    }

}
export function languageName ( code: string, locale: string ): string {

    try { return new Intl.DisplayNames([locale], { type: "language" }).of(code) ?? code; }
    catch { return code; }

}
