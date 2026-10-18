import { languagesOf } from "engine/translate";

export const supportedLocales = ["en", "ar"] as const;

export type Locale = typeof supportedLocales[number];

export const languages = languagesOf(supportedLocales);
