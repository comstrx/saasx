import { type Countries, defineCountries } from "./country.ts";
import { type Currencies, defineCurrencies } from "./currency.ts";
import { defineEmoji, type EmojiOptions, type Emojis } from "./emoji.ts";
import { type Font, fontOf } from "./font.ts";
import { defineKeys, type Keys } from "./key.ts";
import { defineLanguages, type Languages } from "./language.ts";

export type WorldOptions = {
    countries?: readonly string[] | undefined;
    currencies?: readonly string[] | undefined;
    languages?: readonly string[] | undefined;
    emoji?: EmojiOptions | undefined;
};
export type World = {
    countries: Countries;
    keys: Keys;
    currencies: Currencies;
    languages: Languages;
    emojis: Emojis;
    fontOf: ( language: string ) => Font;
};

export function defineWorld ( options: WorldOptions = {} ): World {

    const countries = defineCountries(options.countries);
    const languages = defineLanguages(options.languages);
    let emojis: Emojis | undefined;

    return {
        countries,
        keys: defineKeys(countries.all),
        currencies: defineCurrencies(options.currencies),
        languages,
        get emojis () {

            emojis ??= defineEmoji(options.emoji);

            return emojis;

        },
        fontOf: ( language ) => fontOf(languages.get(language)?.script ?? ""),
    };

}
