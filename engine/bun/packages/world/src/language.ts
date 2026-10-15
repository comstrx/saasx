import { type Catalog, catalog } from "engine/string";
import rows from "../data/languages.json" with { type: "json" };
import { chosen } from "./country.ts";

export type Language = { code: string; direction: "ltr" | "rtl"; script: string; name: { en: string; ar: string; native: string } };
export type Languages = Catalog<Language>;

export const everyLanguage = rows as Language[];

export function defineLanguages ( codes?: readonly string[] ): Languages {

    return catalog(chosen(everyLanguage, ( language ) => language.code, codes, "languages"), ( language ) => language.code, ( language ) => [language.code, language.name.en, language.name.ar, language.name.native]);

}

export const languages: Languages = defineLanguages();
