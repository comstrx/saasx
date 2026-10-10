import { Fragment, type ReactNode, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Choice } from "@/components/choice";
import { PriceBlock, type PriceLine } from "@/components/price-block";
import { Box } from "@/elements/box";
import { Button } from "@/elements/button";
import { Divider } from "@/elements/divider";
import { Plate } from "@/elements/plate";
import { Sheet } from "@/elements/sheet";
import { Text } from "@/elements/text";
import { RailFigure } from "@/features/checkout/components/payment";
import type { Rail } from "@/model/wallet";
import { useTheme } from "@/theme/use-theme";

export type PayChoice = { kind: "wallet" } | { kind: "later" } | { kind: "rail"; id: number };

type PayWallet = {
    allowed: boolean;
    enough: boolean;
    note: string;
};

type PayLedger = {
    lines: readonly PriceLine[];
    total: string;
};

type PaySheetProps = {
    open: boolean;
    amount: string;
    ledger?: PayLedger | undefined;
    wallet: PayWallet;
    later?: boolean | undefined;
    rails?: readonly Rail[] | undefined;
    estimated?: boolean | undefined;
    quoting?: boolean | undefined;
    busy?: boolean | undefined;
    onPay: ( choice: PayChoice ) => void;
    onTopUp: () => void;
    onClose: () => void;
};

const choiceOf = ( picked: string ): PayChoice =>
    picked === "later" ? { kind: "later" }
        : picked.startsWith("rail:") ? { kind: "rail", id: Number(picked.slice(5)) }
            : { kind: "wallet" };

export function PaySheet ({ open, amount, ledger, wallet, later = false, rails = [], estimated = false, quoting = false, busy = false, onPay, onTopUp, onClose }: PaySheetProps) {

    const { t } = useTranslation();
    const theme = useTheme();
    const first = rails[0];
    const preferred = wallet.allowed && wallet.enough ? "wallet" : first ? `rail:${ first.id }` : later ? "later" : "wallet";
    const [ picked, setPicked ] = useState(preferred);

    useEffect(() => {

        if ( open ) setPicked(preferred);

    }, [ open, preferred ]);

    const choice = choiceOf(picked);
    const plate = ( icon: "wallet" | "clock" ) => <Plate icon={icon} size={theme.control.sm.height} tone="brand" look="quiet" />;

    const rows: { key: string; row: ReactNode }[] = [
        ...( wallet.allowed ? [ {
            key: "wallet",
            row: (
                <Choice
                    kind="radio"
                    trail
                    figure={plate("wallet")}
                    label={t("checkout.wallet")}
                    note={wallet.note}
                    selected={picked === "wallet"}
                    onPress={wallet.enough ? () => setPicked("wallet") : onTopUp}
                />
            ),
        } ] : [] ),
        ...rails.map(( rail ) => ({
            key: `rail:${ rail.id }`,
            row: (
                <Choice
                    kind="radio"
                    trail
                    figure={<RailFigure rail={rail} />}
                    label={rail.name}
                    note={rail.note}
                    selected={picked === `rail:${ rail.id }`}
                    onPress={() => setPicked(`rail:${ rail.id }`) }
                />
            ),
        }) ),
        ...( later ? [ {
            key: "later",
            row: (
                <Choice
                    kind="radio"
                    trail
                    figure={plate("clock")}
                    label={t("wallet.rail.later")}
                    note={t("cart.laterBody")}
                    selected={picked === "later"}
                    onPress={() => setPicked("later") }
                />
            ),
        } ] : [] ),
    ];

    return (
        <Sheet
            open={open}
            onClose={onClose}
            title={t("checkout.payChoice")}
            footer={(
                <Button
                    label={choice.kind === "later" ? t("cart.placeLater") : t("checkout.pay", { amount })}
                    loading={busy || quoting}
                    disabled={choice.kind === "wallet" && !wallet.enough}
                    onPress={() => onPay(choice) }
                />
            )}
        >
            <Box gap="5">
                {ledger ? <PriceBlock lines={ledger.lines} total={ledger.total} totalLabel={t("checkout.grandTotal")} /> : null}

                <Box>
                    {rows.map(( entry, index ) => (
                        <Fragment key={entry.key}>
                            {index > 0 ? <Divider /> : null}
                            {entry.row}
                        </Fragment>
                    ))}

                    {estimated ? <Text rank="caption" ink="soft">{t("cart.estimated")}</Text> : null}
                </Box>
            </Box>
        </Sheet>
    );

}
