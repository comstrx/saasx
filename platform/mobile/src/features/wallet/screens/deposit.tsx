import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet } from "react-native-unistyles";
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
import { useMoney } from "@/features/shell/hooks/use-money";
import { useSubmit } from "@/features/shell/hooks/use-submit";
import { retreat } from "@/features/shell/retreat";
import { Awaiting } from "@/features/wallet/components/awaiting";
import { Pad } from "@/features/wallet/components/pad";
import { ceilingOf, fieldsOf, presetsOf, railGlyph, railInitial, railsFor, recipientReady, termsOf, withinRange } from "@/model/wallet";
import { useBalance, useDeposit, useRails } from "@/query/wallet";
import { notify } from "@/store/notice";
import { useTheme } from "@/theme/use-theme";

export function DepositScreen () {

    const { t } = useTranslation();

    const theme = useTheme();
    const [ details, setDetails ] = useState<Record<string, string>>({});

    const purse = useBalance();
    const catalog = useRails(true);
    const deposit = useDeposit();

    const [ amount, setAmount ] = useState("");
    const [ rail, setRail ] = useState<number | null>(null);

    const rails = railsFor(catalog.data ?? [], "deposit");
    const picked = rails.find(( item ) => item.id === rail );
    const slots = fieldsOf(picked, "deposit");
    const held = purse.data?.currency ?? "";
    const terms = termsOf(picked, "deposit", held);
    const currency = terms?.currency ?? held;
    const paid = Number(amount || 0);
    const quick = presetsOf(terms?.max ?? ceilingOf(rails, "deposit", held), terms?.min ?? 0);
    const cash = useMoney();
    const money = useCallback(( value: number ) => cash.amount(value, currency), [ cash, currency ]);

    const owned = useMemo(
        () => [ "amount", "gateway", "currency", ...slots.map(( field ) => field.name ) ],
        [ slots ],
    );

    const { busy, fields, run } = useSubmit(owned);

    const submit = async () => {

        if ( rail === null ) return;

        const outcome = await run("wallet-deposit", ( attempt ) => deposit.mutateAsync({ rail, amount: paid, currency, details, attempt }) );

        if ( !outcome.ok ) return;

        const kind = settlePayment(outcome.value, { kind: "wallet", reference: outcome.value.reference ?? "" });

        if ( kind !== "redirect" ) notify(t("wallet.started"), "success");

        retreat();

    };

    if ( !purse.data ) return <Awaiting title={t("wallet.depositTitle")} read={purse} />;

    return (
        <Screen edges={[ "top" ]} padded={false}>
            <AppBar title={t("wallet.depositTitle")} onBack={() => retreat() } />

            <Scroll docked contentContainerStyle={styles.scroll}>
                <Stagger>
                    <Group>
                        <Row plated tone="success" icon="wallet" title={t("wallet.available")} value={cash.amount(purse.data.available, purse.data.currency)} valueRank="action" />
                    </Group>

                    <Section title={t("services.amount")}>
                        <Pad
                            value={amount}
                            onChange={setAmount}
                            symbol={cash.symbol(currency)}
                            quick={quick}
                            note={terms ? t("wallet.range", { min: money(terms.min), max: money(terms.max) }) : undefined}
                            error={fields.amount}
                        />
                    </Section>

                    <Section title={t("wallet.gateway")}>

                        {catalog.isPending ? (
                            <Box gap="3">
                                <Skeleton curve="card" height={theme.control.lg.height + theme.space["4"]} />
                                <Skeleton curve="card" height={theme.control.lg.height + theme.space["4"]} />
                            </Box>
                        ) : null}

                        <Rails
                            rails={rails.map(( item ) => ({ key: String(item.id), label: item.name, note: item.note || termsOf(item, "deposit", held)?.currency || held, icon: railGlyph(item), image: item.image, initial: railInitial(item) }) )}
                            picked={rail === null ? "" : String(rail)}
                            onPick={( key ) => setRail(Number(key)) }
                        />

                        {catalog.error && !catalog.data ? (
                            <Trouble reason={catalog.error} onAction={() => void catalog.refetch()} />
                        ) : !catalog.isPending && rails.length === 0 ? (
                            <Empty emblem="wallet" title={t("wallet.noGateways")} />
                        ) : null}
                    </Section>

                    {slots.length > 0 ? (
                        <Section title={t("wallet.transferDetails")} note={t("wallet.transferDetailsBody")}>

                            {slots.map(( field ) => (
                                <Field
                                    key={field.name}
                                    placeholder={t(`wallet.field.${ field.name }`, { defaultValue: field.placeholder || field.label })}
                                    value={details[field.name] ?? ""}
                                    onChangeText={( value ) => setDetails(( current ) => ({ ...current, [field.name]: value }) )}
                                    autoCapitalize="none"
                                    keyboardType={field.type === "phone" ? "phone-pad" : "default"}
                                    ltr={field.type === "phone"}
                                    error={fields[field.name]}
                                />
                            ))}
                        </Section>
                    ) : null}
                </Stagger>
            </Scroll>

            <Dock>
                <Button
                    label={paid > 0 ? t("wallet.depositAmount", { amount: money(paid) }) : t("wallet.depositAction")}
                    loading={busy}
                    disabled={rail === null || !withinRange(terms, paid) || !recipientReady(slots, details)}
                    onPress={submit}
                />
            </Dock>
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
