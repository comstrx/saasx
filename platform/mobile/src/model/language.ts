type Language = {
    code: string;
    native: string;
    ar: string;
    en: string;
    rtl: boolean;
    flag: string;
};

export const languages: readonly Language[] = [
    { code: "ar", native: "العربية", ar: "العربية", en: "Arabic", rtl: true, flag: "sa" },
    { code: "en", native: "English", ar: "الإنجليزية", en: "English", rtl: false, flag: "gb" },
];

export const languageByCode: ReadonlyMap<string, Language> = new Map(languages.map(( language ) => [ language.code, language ]));
