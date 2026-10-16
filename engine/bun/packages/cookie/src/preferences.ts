import { isRecord } from "engine/base";
import { negotiate } from "engine/translate";
import { currency as currencyShape } from "engine/validate";

export type Preferences = { language?: string | undefined; currency?: string | undefined; theme?: string | undefined };
export type PreferenceChoices = {
    languages: readonly string[];
    currencies?: readonly string[] | undefined;
    themes?: readonly string[] | undefined;
};
export type PreferenceNames = { language: string; currency: string; theme?: string | undefined };
export type PreferenceReader = ( name: string ) => string | undefined;
export type PreferenceJar = {
    read: ( get: PreferenceReader ) => Preferences;
    detect: ( acceptLanguage: string | null | undefined, saved: Preferences ) => Preferences;
    changes: ( preferences: Preferences ) => [string, string][];
    accept: ( input: unknown ) => Preferences;
};

function text ( value: unknown ): string | undefined {

    return typeof value === "string" ? value : undefined;

}
export function acceptPreferences ( input: unknown, { languages, currencies, themes = [] }: PreferenceChoices ): Preferences {

    if ( !isRecord(input) ) return {};

    const language = text(input.language);
    const currency = text(input.currency);
    const theme = text(input.theme);
    const known = currencies ? currencies.some(( code ) => code === currency) : currencyShape.safeParse(currency).success;

    return {
        ...(language && languages.includes(language) ? { language } : {}),
        ...(currency && known ? { currency } : {}),
        ...(theme && themes.includes(theme) ? { theme } : {}),
    };

}
export function preferenceJar ( names: PreferenceNames, choices: PreferenceChoices ): PreferenceJar {

    const allowed = names.theme === undefined ? { ...choices, themes: [] } : choices;
    const accept = ( input: unknown ): Preferences => acceptPreferences(input, allowed);

    return {
        accept,
        read: ( get ) => accept({
            language: get(names.language),
            currency: get(names.currency),
            theme: names.theme === undefined ? undefined : get(names.theme),
        }),
        detect: ( acceptLanguage, saved ) => {

            if ( saved.language ) return {};

            const language = negotiate(acceptLanguage, choices.languages);

            return language ? { language } : {};

        },
        changes: ( preferences ) =>
            (
                [
                    [names.language, preferences.language],
                    [names.currency, preferences.currency],
                    [names.theme, allowed.themes?.length ? preferences.theme : undefined],
                ] as [string | undefined, string | undefined][]
            ).filter(( entry ): entry is [string, string] => entry[0] !== undefined && entry[1] !== undefined),
    };

}
