import { type Locale, locales } from "./locales";

export function isLocale( value: string | undefined ): value is Locale {

    return locales.includes(value as Locale);

}
