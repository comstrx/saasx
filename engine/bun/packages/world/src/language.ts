import { type Catalog, catalog } from "engine/string";
import rows from "../data/languages.json" with { type: "json" };
import { chosen } from "./country.ts";

export type Language = { code: string; direction: "ltr" | "rtl"; script: string; name: { en: string; ar: string; native: string } };
export type Languages = Catalog<Language>;

export const everyLanguage = rows as Language[];

export function defineLanguages ( codes?: readonly string[] ): Languages {

    const picked = chosen(everyLanguage, ( language ) => language.code, codes, "languages");

    const fields = ( language: Language ): string[] => [language.code, language.name.en, language.name.ar, language.name.native];

    return catalog(picked, ( language ) => language.code, fields);

}

export const languages: Languages = defineLanguages();
