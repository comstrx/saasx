
export const locales = ["en", "ar", "fr", "de"] as const;

export type Direction = "ltr" | "rtl";
export type Locale = (typeof locales)[number];

export function isLocale ( value: string | undefined ): value is Locale {

    return locales.includes(value as Locale);

}
export function getDirection ( locale: Locale ): Direction {

    return locale === "ar" ? "rtl" : "ltr";

}
