import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { currencyByCode, symbolOf } from "@/model/currency";
import { useServedCurrencies } from "@/query/vocabulary";
import { formatAmount } from "@/std/number";
import { useScript } from "@/theme/use-script";

type Money = {
    amount: ( value: number, currency: string ) => string;
    round: ( value: number, currency: string ) => string;
    symbol: ( currency: string ) => string;
};

export function useMoney (): Money {

    const { i18n } = useTranslation();
    const script = useScript();
    const served = useServedCurrencies();
    const locale = i18n.language;
    const rows = served.data;

    return useMemo(() => {

        const arabic = script === "arabic";
        const digits = new Map(( rows ?? [] ).map(( row ) => [ row.code, row.digits ] ));
        const symbols = new Map(( rows ?? [] ).map(( row ) => [ row.code, row.symbol ] ));

        const symbol = ( currency: string ) => symbolOf(currency, arabic, symbols.get(currency));
        const write = ( value: number, currency: string, places: number ) => formatAmount(locale, symbol(currency), value, places);

        return {
            amount: ( value, currency ) => write(value, currency, digits.get(currency) ?? currencyByCode.get(currency)?.digits ?? 2),
            round: ( value, currency ) => write(value, currency, 0),
            symbol,
        };

    }, [ locale, rows, script ]);

}
