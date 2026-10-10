export const supportedLocales = ["en", "ar"] as const;

export type Locale = typeof supportedLocales[number];

export const languages = {
    en: { label: "English", direction: "ltr", openGraph: "en_US", flag: "GB", comma: ", ", range: null },
    ar: {
        label: "العربية",
        direction: "rtl",
        openGraph: "ar_AR",
        flag: "SA",
        comma: "، ",
        range: "U+0600-06FF, U+0750-077F, U+08A0-08FF, U+FB50-FDFF, U+FE70-FEFF",
    },
} as const;
