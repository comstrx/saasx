import { useState } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet } from "react-native-unistyles";
import { Alert } from "@/elements/alert";
import { Box } from "@/elements/box";
import { Button } from "@/elements/button";
import { Sheet } from "@/elements/sheet";
import { Spec } from "@/elements/spec";
import { useMethod } from "@/features/shell/hooks/use-method";
import { useMoney } from "@/features/shell/hooks/use-money";
import { cancelFee, credits, type Transaction } from "@/model/wallet";
import { useCancelTransaction } from "@/query/wallet";
import { isolateLtr } from "@/std/bidi";
import { formatDate, formatNumber } from "@/std/number";
import { notify } from "@/store/notice";
import type { ToneName } from "@/theme/roles";

type EntrySheetProps = {
    entry: Transaction | null;
    onClose: () => void;
};

const tints: Record<Transaction["state"], ToneName> = {
    pending: "warning",
    successful: "success",
    failed: "danger",
    refunded: "brand",
    cancelled: "danger",
};

export function EntrySheet ({ entry, onClose }: EntrySheetProps) {

    const { t, i18n } = useTranslation();
    const money = useMoney();
    const method = useMethod();
    const cancel = useCancelTransaction();
    const [ asking, setAsking ] = useState(false);

    const fee = entry ? cancelFee(entry, Date.now()) : 0;
    const rate = fee > 0 && entry ? entry.penaltyRate : 0;
    const cash = ( value: number ) => entry ? money.amount(value, entry.currency) : "";
    const percent = formatNumber(i18n.language, rate, rate % 1 === 0 ? 0 : 2);

    const confirm = () => {

        if ( !entry ) return;

        setAsking(false);

        cancel.mutate(entry.id, {
            onSuccess: () => {

                notify(t("wallet.entry.cancelled"), "success");
                onClose();

            },
        });

    };

    const footer = entry?.canCancel ? (
        <Button label={t("wallet.entry.cancel")} kind="soft" tint="danger" icon="close" loading={cancel.isPending} onPress={() => setAsking(true) } />
    ) : undefined;

    return (
        <>
            <Sheet
                open={entry !== null}
                onClose={onClose}
                title={entry ? isolateLtr(`${ credits(entry.kind) ? "+" : "−" }${ cash(entry.amount) }`) : ""}
                footer={footer}
            >
                {entry ? (
                    <Box gap="4" style={styles.rows}>
                        <Spec label={t("wallet.entry.kind")} value={t(`wallet.kind.${ entry.kind }`)} />
                        <Spec label={t("wallet.entry.status")} value={t(`wallet.state.${ entry.state }`)} tint={tints[entry.state]} />
                        {entry.gateway ? <Spec label={t("wallet.entry.method")} value={method(entry.gateway)} /> : null}
                        {entry.reference ? <Spec label={t("wallet.entry.reference")} value={isolateLtr(entry.reference)} /> : null}
                        {entry.at ? <Spec label={t("wallet.entry.date")} value={formatDate(i18n.language, entry.at, "medium")} /> : null}
                        {fee > 0 ? (
                            <Spec
                                label={t("wallet.entry.penalty")}
                                value={t("wallet.entry.penaltyValue", { rate: percent, fee: isolateLtr(cash(fee)) })}
                                tint="warning"
                            />
                        ) : null}
                    </Box>
                ) : null}
            </Sheet>

            <Alert
                open={asking}
                title={t("wallet.entry.cancelTitle")}
                emblem="wallet"
                body={fee > 0
                    ? t("wallet.entry.cancelPenalty", { rate: percent, fee: isolateLtr(cash(fee)), back: isolateLtr(cash(( entry?.amount ?? 0 ) - fee)) })
                    : t("wallet.entry.cancelBody")}
                confirm={t("wallet.entry.cancel")}
                onConfirm={confirm}
                tone="danger"
                cancel={t("common.cancel")}
                onClose={() => setAsking(false) }
            />
        </>
    );

}

const styles = StyleSheet.create(( theme ) => ({

    rows: {
        paddingBottom: theme.space["2"],
    },

}));
