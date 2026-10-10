import { preferences, routing } from "@/lib/spec/config";
import { currencyOf, formatPoint, isCountry, isCurrency, type Point, parsePoint } from "@/lib/std/geo";
import { negotiate, regionOf } from "@/lib/std/locale";
import { compact, includes } from "@/lib/std/object";

export type Preferences = { language?: string; currency?: string; country?: string; location?: Point | null };

const edgeCountries = ["cf-ipcountry", "cloudfront-viewer-country", "x-vercel-ip-country"];

export const cookieOptions = {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: preferences.maxAge,
} as const;

function located ( value: string | undefined ): Point | null | undefined {

    return value === "denied" ? null : parsePoint(value);

}
export function readPreferences ( read: ( name: string ) => string | undefined ): Preferences {

    const { cookies } = preferences;
    const language = read(cookies.language);
    const currency = read(cookies.currency);
    const country = read(cookies.country);

    return compact({
        language: includes(routing.locales, language) ? language : undefined,
        currency: isCurrency(currency) ? currency : undefined,
        country: isCountry(country) ? country : undefined,
        location: located(read(cookies.location)),
    });

}
export function detectPreferences ( headers: Headers, saved: Preferences ): Preferences {

    const accepted = headers.get("accept-language");
    const edge = edgeCountries.map(( name ) => headers.get(name)?.toUpperCase()).find(isCountry);
    const country = saved.country ?? edge ?? regionOf(accepted);

    return compact({
        language: saved.language ? undefined : negotiate(accepted, routing.locales),
        country: saved.country ? undefined : country,
        currency: saved.currency || !country ? undefined : currencyOf(country),
    });

}
export function preferenceCookies ( changes: Preferences ): [string, string][] {

    const { cookies } = preferences;
    const { language, currency, country, location } = changes;
    const entries: [string, string | undefined][] = [
        [cookies.language, language],
        [cookies.currency, currency],
        [cookies.country, country],
        [cookies.location, location === null ? "denied" : location && formatPoint(location)],
    ];

    return entries.filter(( entry ): entry is [string, string] => entry[1] !== undefined);

}
