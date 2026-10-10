import { useTranslation } from "react-i18next";
import { PriceBlock, type PriceLine } from "@/components/price-block";
import { Link } from "@/elements/link";
import { CheckoutSection } from "@/features/checkout/components/section";
import { useMoney } from "@/features/shell/hooks/use-money";
import type { Line, QuoteFace } from "@/model/order";

type LedgerExtra = {
    key: string;
    label: string;
    amount: number;
    currency: string;
};

type CheckoutLedgerProps = {
    face: QuoteFace;
    extras?: readonly LedgerExtra[] | undefined;
    onInfo: () => void;
};

export function usePriceLines () {

    const { t } = useTranslation();
    const money = useMoney();

    return ( lines: readonly Line[] ): PriceLine[] => lines.map(( line ) => ({
        key: line.key,
        label: t(`checkout.line.${ line.key }`, { defaultValue: line.key }),
        amount: money.amount(line.tone === "discount" ? -line.amount.amount : line.amount.amount, line.amount.currency),
        off: line.tone === "discount",
    }) );

}

export function CheckoutLedger ({ face, extras = [], onInfo }: CheckoutLedgerProps) {

    const { t } = useTranslation();
    const money = useMoney();
    const priceLines = usePriceLines();

    const lines: readonly PriceLine[] = [
        ...priceLines(face.lines),
        ...extras.map(( extra ) => ({ key: extra.key, label: extra.label, amount: money.amount(extra.amount, extra.currency) }) ),
    ];

    return (
        <CheckoutSection title={t("checkout.breakdown")}>
            <PriceBlock
                lines={lines}
                total={money.amount(face.total, face.currency)}
                totalLabel={t("checkout.grandTotal")}
            />

            <Link label={t("checkout.priceInfo")} rank="body" onPress={onInfo} />
        </CheckoutSection>
    );

}
