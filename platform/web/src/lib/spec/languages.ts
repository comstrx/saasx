import { type Language, languageFacts } from "engine/translate";

export const supportedLocales = ["en", "ar"] as const;

export type Locale = typeof supportedLocales[number];

export const languages = Object.fromEntries(supportedLocales.map(( locale ) => [locale, languageFacts(locale)])) as Record<Locale, Language>;
