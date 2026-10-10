import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet } from "react-native-unistyles";
import { ConfirmSheet } from "@/components/confirm-sheet";
import { Group } from "@/components/group";
import { Rails } from "@/components/rails";
import { Section } from "@/components/section";
import { AppBar } from "@/elements/app-bar";
import { Box } from "@/elements/box";
import { Button } from "@/elements/button";
import { Dock } from "@/elements/dock";
import { Empty } from "@/elements/empty";
import { Field } from "@/elements/field";
import { Stagger } from "@/elements/motion";
import { Row } from "@/elements/row";
import { Screen } from "@/elements/screen";
import { Scroll } from "@/elements/scroll";
import { Skeleton } from "@/elements/skeleton";
import { settlePayment } from "@/features/checkout/hooks/use-payment";
import { Trouble } from "@/features/shell";
import { useConfirmCopy } from "@/features/shell/copy";
import { useConfirm } from "@/features/shell/hooks/use-confirm";
import { useMoney } from "@/features/shell/hooks/use-money";
import { retreat } from "@/features/shell/retreat";
import { Awaiting } from "@/features/wallet/components/awaiting";
import { Pad } from "@/features/wallet/components/pad";
import type { PaymentIntent } from "@/model/payment";
import { feeOf, fieldsOf, presetsOf, railGlyph, railInitial, railsFor, recipientReady, termsOf, withinRange } from "@/model/wallet";
import { useBalance, useRails, useWithdraw } from "@/query/wallet";
import { notify } from "@/store/notice";
import { useTheme } from "@/theme/use-theme";

export function WithdrawScreen () {

    const { t } = useTranslation();
    const confirmCopy = useConfirmCopy();

    const theme = useTheme();

    const purse = useBalance();
    const catalog = useRails(true);
    const withdraw = useWithdraw();

    const [ amount, setAmount ] = useState("");
    const [ way, setWay ] = useState<number | null>(null);
    const [ recipient, setRecipient ] = useState<Record<string, string>>({});

    const rails = railsFor(catalog.data ?? [], "withdraw");
    const picked = rails.find(( item ) => item.id === way );
    const held = purse.data?.currency ?? "";
    const terms = termsOf(picked, "withdraw", held);
    const slots = fieldsOf(picked, "withdraw");
    const currency = terms?.currency ?? held;

    const owned = useMemo(
        () => [ "amount", "gateway", "currency", "balance", ...slots.map(( field ) => field.name ) ],
        [ slots ],
    );

    const paid = Number(amount || 0);
    const fee = feeOf(terms, paid);
    const cashIn = currency === purse.data?.baseCurrency ? currency : held;
    const cashable = cashIn === held ? purse.data?.withdrawable ?? 0 : purse.data?.withdrawableBase ?? 0;
    const exceeds = currency === cashIn && paid > cashable;
    const quick = presetsOf(Math.min(cashable, terms?.max ?? cashable), terms?.min ?? 0);

    const cash = useMoney();
    const money = useCallback(
        ( value: number, code = currency ) => cash.amount(value, code),
        [ cash, currency ],
    );

    const landed = useCallback(( intent: PaymentIntent ) => {

        const kind = settlePayment(intent, { kind: "wallet", reference: intent.reference ?? "" });

        if ( kind !== "redirect" ) notify(t("wallet.started"), "success");

        retreat();

    }, [ t ]);

    const confirm = useConfirm(landed, owned);

    const submit = () => {

        if ( way === null ) return;

        void confirm.run("wallet-withdraw", ( attempt, code ) =>
            withdraw.mutateAsync({ rail: way, amount: paid, currency, recipient, attempt, code }) );

    };

    const ready = withinRange(terms, paid) && recipientReady(slots, recipient) && !exceeds;

    const note = terms && paid > 0
        ? t("wallet.fee", { fee: money(fee), net: money(Math.max(0, paid - fee)) })
        : terms
            ? t("wallet.range", { min: money(terms.min), max: money(terms.max) })
            : undefined;

    if ( !purse.data ) return <Awaiting title={t("wallet.withdrawTitle")} read={purse} />;

    return (
        <Screen edges={[ "top" ]} padded={false}>
            <AppBar title={t("wallet.withdrawTitle")} onBack={() => retreat() } />

            <Scroll docked contentContainerStyle={styles.scroll}>
                <Stagger>
                    <Group>
                        <Row plated tone="danger" icon="withdraw" title={t("wallet.cashable")} value={money(cashable, cashIn)} valueRank="action" />
                    </Group>

                    <Section title={t("services.amount")}>
                        <Pad
                            value={amount}
                            onChange={setAmount}
                            symbol={cash.symbol(currency)}
                            quick={quick}
                            note={note}
                            error={exceeds ? t("wallet.cashableLimit", { amount: money(cashable, cashIn) }) : confirm.fields.amount}
                        />
                    </Section>

                    <Section title={t("wallet.method")}>

                        {catalog.isPending ? (
                            <Box gap="3">
                                <Skeleton curve="card" height={theme.control.lg.height + theme.space["4"]} />
                                <Skeleton curve="card" height={theme.control.lg.height + theme.space["4"]} />
                            </Box>
                        ) : null}

                        <Rails
                            rails={rails.map(( item ) => ({ key: String(item.id), label: item.name, note: item.note || termsOf(item, "withdraw", held)?.currency || held, icon: railGlyph(item), image: item.image, initial: railInitial(item) }) )}
                            picked={way === null ? "" : String(way)}
                            onPick={( key ) => { setWay(Number(key)); setRecipient({}); }}
                        />

                        {catalog.error && !catalog.data ? (
                            <Trouble reason={catalog.error} onAction={() => void catalog.refetch()} />
                        ) : !catalog.isPending && rails.length === 0 ? (
                            <Empty emblem="wallet" title={t("wallet.noMethods")} />
                        ) : null}
                    </Section>

                    {slots.length > 0 ? (
                        <Section title={t("wallet.recipient")}>

                            {slots.map(( field ) => (
                                <Field
                                    key={field.name}
                                    placeholder={t(`wallet.field.${ field.name }`, { defaultValue: field.placeholder || field.label })}
                                    value={recipient[field.name] ?? ""}
                                    onChangeText={( value ) => setRecipient(( current ) => ({ ...current, [field.name]: value }) )}
                                    autoCapitalize="none"
                                    keyboardType={field.type === "phone" ? "phone-pad" : "default"}
                                    ltr={field.type === "phone"}
                                    error={confirm.fields[field.name]}
                                />
                            ))}
                        </Section>
                    ) : null}
                </Stagger>
            </Scroll>

            <Dock>
                <Button
                    label={paid > 0 ? t("wallet.withdrawAmount", { amount: money(paid) }) : t("wallet.withdrawAction")}
                    loading={confirm.busy}
                    disabled={!ready}
                    onPress={submit}
                />
            </Dock>

            <ConfirmSheet
                copy={confirmCopy}
                open={confirm.asking}
                busy={confirm.busy}
                wrong={confirm.wrong}
                challenge={confirm.challenge}
                note={t("confirm.withdrawBody", { amount: money(paid) })}
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
