import type { Locale } from "./locales";

export type Direction = "ltr" | "rtl";

export function getDirection( locale: Locale ): Direction {

    return locale === "ar" ? "rtl" : "ltr";

}
