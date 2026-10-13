import { isRecord } from "@engine/base";
import { negotiate } from "@engine/translate";
import { currency as currencyShape } from "@engine/validate";

export type Preferences = { language?: string | undefined; currency?: string | undefined; theme?: string | undefined };
export type PreferenceNames = { language: string; currency: string; theme?: string | undefined };
export type PreferenceReader = (name: string) => string | undefined;
export type PreferenceJar = {
    read: (get: PreferenceReader) => Preferences;
    detect: (acceptLanguage: string | null | undefined, saved: Preferences) => Preferences;
    changes: (preferences: Preferences) => [string, string][];
    accept: (input: unknown) => Preferences;
};

/**
 * The viewer preferences every surface keeps in cookies (language, currency and, when the surface
 * names a cookie for it, theme): read them back only when still valid, detect a first language
 * from the Accept-Language header, keep the valid part of an untrusted change, and list the cookie
 * writes a change needs.
 */
export function preferenceJar(
    names: PreferenceNames,
    locales: readonly string[],
    themes: readonly string[] = [],
): PreferenceJar {
    const themed = names.theme !== undefined && themes.length > 0;
    const valid = (given: Preferences): Preferences => ({
        ...(given.language && locales.includes(given.language) ? { language: given.language } : {}),
        ...(currencyShape.safeParse(given.currency).success ? { currency: given.currency } : {}),
        ...(themed && given.theme && themes.includes(given.theme) ? { theme: given.theme } : {}),
    });
    const text = (value: unknown): string | undefined => (typeof value === "string" ? value : undefined);

    return {
        read: (get) =>
            valid({
                language: get(names.language),
                currency: get(names.currency),
                theme: names.theme === undefined ? undefined : get(names.theme),
            }),
        detect: (acceptLanguage, saved) => {
            if (saved.language) return {};

            const language = negotiate(acceptLanguage, locales);

            return language ? { language } : {};
        },
        changes: (preferences) =>
            (
                [
                    [names.language, preferences.language],
                    [names.currency, preferences.currency],
                    [names.theme, themed ? preferences.theme : undefined],
                ] as [string | undefined, string | undefined][]
            ).filter((entry): entry is [string, string] => entry[0] !== undefined && entry[1] !== undefined),
        accept: (input) =>
            isRecord(input)
                ? valid({ language: text(input.language), currency: text(input.currency), theme: text(input.theme) })
                : {},
    };
}
