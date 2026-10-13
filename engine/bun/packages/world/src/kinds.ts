export type Named = { en: string; ar: string; native: string };
export type Country = {
    alpha2: string;
    alpha3: string;
    numeric: string;
    region: string;
    subregion: string;
    dial: string;
    dials: readonly string[];
    currencies: readonly string[];
    languages: readonly string[];
    name: Named;
};
export type Currency = { code: string; symbol: string; digits: number; countries: readonly string[]; name: Named };
export type Language = { code: string; direction: "ltr" | "rtl"; name: Named };
