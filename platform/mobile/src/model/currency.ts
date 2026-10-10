import { decimal } from "@/std/number";

export { baseCurrency } from "@/api/contracts";

type Currency = {
    code: string;
    symbol: string;
    latin?: string;
    ar: string;
    en: string;
    digits: number;
    flag: string;
};

export const currencies: readonly Currency[] = [
    { code: "USD", symbol: "$", ar: "دولار أمريكي", en: "US Dollar", digits: 2, flag: "us" },
    { code: "EUR", symbol: "€", ar: "يورو", en: "Euro", digits: 2, flag: "eu" },
    { code: "GBP", symbol: "£", ar: "جنيه إسترليني", en: "British Pound", digits: 2, flag: "gb" },
    { code: "SAR", symbol: "ر.س", latin: "SAR", ar: "ريال سعودي", en: "Saudi Riyal", digits: 2, flag: "sa" },
    { code: "AED", symbol: "د.إ", latin: "AED", ar: "درهم إماراتي", en: "UAE Dirham", digits: 2, flag: "ae" },
    { code: "KWD", symbol: "د.ك", latin: "KWD", ar: "دينار كويتي", en: "Kuwaiti Dinar", digits: 3, flag: "kw" },
    { code: "QAR", symbol: "ر.ق", latin: "QAR", ar: "ريال قطري", en: "Qatari Riyal", digits: 2, flag: "qa" },
    { code: "BHD", symbol: "د.ب", latin: "BHD", ar: "دينار بحريني", en: "Bahraini Dinar", digits: 3, flag: "bh" },
    { code: "EGP", symbol: "ج.م", latin: "EGP", ar: "جنيه مصري", en: "Egyptian Pound", digits: 2, flag: "eg" },
    { code: "IQD", symbol: "د.ع", latin: "IQD", ar: "دينار عراقي", en: "Iraqi Dinar", digits: 0, flag: "iq" },
    { code: "JOD", symbol: "د.أ", latin: "JOD", ar: "دينار أردني", en: "Jordanian Dinar", digits: 3, flag: "jo" },
    { code: "OMR", symbol: "ر.ع", latin: "OMR", ar: "ريال عماني", en: "Omani Rial", digits: 3, flag: "om" },
    { code: "MAD", symbol: "د.م", latin: "MAD", ar: "درهم مغربي", en: "Moroccan Dirham", digits: 2, flag: "ma" },
    { code: "TRY", symbol: "₺", ar: "ليرة تركية", en: "Turkish Lira", digits: 2, flag: "tr" },
    { code: "RUB", symbol: "₽", ar: "روبل روسي", en: "Russian Ruble", digits: 2, flag: "ru" },
    { code: "CHF", symbol: "CHF", ar: "فرنك سويسري", en: "Swiss Franc", digits: 2, flag: "ch" },
    { code: "KRW", symbol: "₩", ar: "وون كوري", en: "South Korean Won", digits: 0, flag: "kr" },
    { code: "INR", symbol: "₹", ar: "روبية هندية", en: "Indian Rupee", digits: 2, flag: "in" },
    { code: "JPY", symbol: "¥", ar: "ين ياباني", en: "Japanese Yen", digits: 0, flag: "jp" },
    { code: "CNY", symbol: "¥", ar: "يوان صيني", en: "Chinese Yuan", digits: 2, flag: "cn" },
];

export const currencyByCode: ReadonlyMap<string, Currency> = new Map(currencies.map(( currency ) => [ currency.code, currency ]));

export const wireAmount = ( amount: number, currency: string ): string => decimal(amount, currencyByCode.get(currency)?.digits ?? 2);

export const symbolOf = ( code: string, arabic: boolean, fallback?: string | undefined ): string => {

    const known = currencyByCode.get(code);
    const local = arabic ? known?.symbol : known?.latin ?? known?.symbol;

    return local || fallback || code;

};
