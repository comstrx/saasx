import { useCallback } from "react";
import { useUnit } from "@/features/catalog/hooks/use-unit";
import { useMoney } from "@/features/shell/hooks/use-money";
import { type Money, priced } from "@/model/catalog";

export function usePriceTag () {

    const money = useMoney();
    const unitLabel = useUnit();

    return useCallback(
        ( price: Money | null | undefined, unit?: string | null, sale?: Money | null ) => {

            if ( !price || !priced(price) ) return undefined;

            const lowered = sale && priced(sale) && sale.amount < price.amount ? sale : null;

            return {
                amount: money.amount(( lowered ?? price ).amount, ( lowered ?? price ).currency),
                was: lowered ? money.amount(price.amount, price.currency) : undefined,
                unit: unitLabel(unit),
            };

        },
        [ money, unitLabel ],
    );

}
