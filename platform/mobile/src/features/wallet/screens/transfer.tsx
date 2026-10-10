import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet } from "react-native-unistyles";
import { ConfirmSheet } from "@/components/confirm-sheet";
import { Group } from "@/components/group";
import { Section } from "@/components/section";
import { AppBar } from "@/elements/app-bar";
import { Button } from "@/elements/button";
import { Dock } from "@/elements/dock";
import { Field } from "@/elements/field";
import { useDebounced } from "@/elements/hooks/use-debounced";
import { Stagger } from "@/elements/motion";
import { Row } from "@/elements/row";
import { Screen } from "@/elements/screen";
import { Scroll } from "@/elements/scroll";
import { useConfirmCopy } from "@/features/shell/copy";
import { useConfirm } from "@/features/shell/hooks/use-confirm";
import { useMoney } from "@/features/shell/hooks/use-money";
import { retreat } from "@/features/shell/retreat";
import { Awaiting } from "@/features/wallet/components/awaiting";
import { Pad } from "@/features/wallet/components/pad";
import { RecipientCard } from "@/features/wallet/components/recipient-card";
import { failureBody, isFailure } from "@/model/failure";
import { presetsOf } from "@/model/wallet";
import { useBalance, useRecipient, useTransfer } from "@/query/wallet";
import { notify } from "@/store/notice";

export function TransferScreen () {

    const { t } = useTranslation();
    const confirmCopy = useConfirmCopy();

    const purse = useBalance();
    const transfer = useTransfer();

    const [ recipient, setRecipient ] = useState("");
    const [ amount, setAmount ] = useState("");

    const settled = useDebounced(recipient, 400);
    const found = useRecipient(settled);

    const currency = purse.data?.currency ?? "";
    const available = purse.data?.spendable ?? 0;
    const paid = Number(amount || 0);
    const quick = presetsOf(available);

    const cash = useMoney();
    const money = useCallback(( value: number ) => cash.amount(value, currency), [ cash, currency ]);

    const settle = useCallback(() => {

        notify(t("wallet.transferDone"), "success");
        retreat();

    }, [ t ]);

    const confirm = useConfirm<unknown>(settle);

    const send = () => {

        if ( !found.data ) return;

        void confirm.run("wallet-transfer", ( attempt, code ) => transfer.mutateAsync({ recipient: settled, amount: paid, currency, attempt, code }) );

    };

    const exceeds = paid > available;
    const ready = Boolean(found.data) && paid > 0 && !exceeds;

    const failure = isFailure(found.error) ? found.error : null;
    const missing = settled.length > 3 && !found.isFetching && Boolean(failure?.missing);

    useEffect(() => {

        if ( failure && !failure.missing ) notify(failureBody(failure));

    }, [ failure ]);

    if ( !purse.data ) return <Awaiting title={t("wallet.transferTitle")} read={purse} />;

    return (
        <Screen edges={[ "top" ]} padded={false}>
            <AppBar title={t("wallet.transferTitle")} onBack={() => retreat() } />

            <Scroll docked contentContainerStyle={styles.scroll}>
                <Stagger>
                    <Group>
                        <Row plated tone="info" icon="transfer" title={t("wallet.transferable")} note={t("wallet.transferBody")} value={money(available)} valueRank="action" />
                    </Group>

                    <Section title={t("wallet.transferTo")}>

                        <Field
                            placeholder={t("wallet.transferHint")}
                            icon="user"
                            value={recipient}
                            onChangeText={setRecipient}
                            autoCapitalize="none"
                            autoCorrect={false}
                            keyboardType="email-address"
                            error={missing ? t("wallet.transferMissing") : undefined}
                        />

                        <RecipientCard recipient={found.data} label={t("wallet.transferReceiver")} />
                    </Section>

                    <Section title={t("services.amount")}>
                        <Pad
                            value={amount}
                            onChange={setAmount}
                            symbol={cash.symbol(currency)}
                            quick={quick}
                            error={exceeds ? t("wallet.exceeds") : undefined}
                        />
                    </Section>
                </Stagger>
            </Scroll>

            <Dock>
                <Button
                    label={paid > 0 ? t("wallet.transferAmount", { amount: money(paid) }) : t("wallet.transferAction")}
                    loading={confirm.busy}
                    disabled={!ready}
                    onPress={send}
                />
            </Dock>

            <ConfirmSheet
                copy={confirmCopy}
                open={confirm.asking}
                busy={confirm.busy}
                wrong={confirm.wrong}
                challenge={confirm.challenge}
                note={t("confirm.transferBody", { amount: money(paid), name: found.data?.name ?? "" })}
                onSubmit={( code ) => { void confirm.answer(code); }}
                onResend={() => { void confirm.resend(); }}
                onClose={confirm.dismiss}
            />
        </Screen>
    );

}

const styles = StyleSheet.create(( theme ) => ({

    scroll: {
        gap: theme.layout.section,
        paddingHorizontal: theme.layout.gutter,
        paddingTop: theme.space["2"],
    },

}));
