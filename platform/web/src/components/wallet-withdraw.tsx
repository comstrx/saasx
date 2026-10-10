"use client";

import Button from "@/elements/button";
import Choices from "@/elements/choices";
import Dialog from "@/elements/dialog";
import Field from "@/elements/field";
import Form from "@/elements/form";
import Stack from "@/elements/stack";
import Text from "@/elements/text";
import { useWalletWithdraw } from "@/hooks/use-wallet-withdraw";
import Icon from "@/icons/icon";
import ConfirmCode from "./confirm-code";
import FormFeedback from "./form-feedback";
import SectionSkeleton from "./section-skeleton";

type Props = { open: boolean; currency: string; close: string; onOpenChange: ( open: boolean ) => void; onDone: () => void };

export default function WalletWithdraw ({ open, currency, close, onOpenChange, onDone }: Props) {

    const state = useWalletWithdraw(currency, open, onDone);
    const { t, form, confirmation } = state;

    return (

        <Dialog
            open={open} onOpenChange={( next ) => { if ( !next ) state.reset(); onOpenChange(next); }}
            title={t("withdrawTitle")} description={t("withdrawHint")} close={close} dismissible={!state.pending}
        >

            {state.loading ? <SectionSkeleton /> : !state.options.length ? <Text tone="muted">{t("noGateways")}</Text> : state.done ? (

                <Stack gap={4} align="center">

                    <Icon name="check-circle" size="xl" tone="accent" />

                    <Text align="center">{t("withdrawRequested")}</Text>

                    <Button width="full" onClick={() => onOpenChange(false)}>{t("done")}</Button>

                </Stack>

            ) : (

                <Form pending={state.pending} noValidate onSubmit={( event ) => { event.preventDefault(); void state.submit(); }}>

                    <Field
                        id={form.id("amount")} label={t("amount")} inputMode="decimal" value={form.values.amount} error={form.errors.amount}
                        end={<Text as="span" size="small" tone="muted">{currency}</Text>} disabled={state.pending}
                        onChange={( event ) => form.change({ amount: event.target.value })}
                    />

                    <Choices
                        label={t("gateway")} labelVisible value={form.values.gateway} disabled={state.pending} options={state.options}
                        onValueChange={( value ) => form.change({ gateway: value })}
                    />

                    {state.fields.map(( slot ) => (

                        <Field
                            key={slot.name} id={form.id(`detail-${slot.name}`)} label={slot.label || slot.name}
                            placeholder={slot.placeholder ?? undefined} type={slot.type === "email" ? "email" : "text"}
                            value={state.details[slot.name] ?? ""} error={form.errors[`detail-${slot.name}`]}
                            required={slot.required ?? false} disabled={state.pending} dir="auto"
                            onChange={( event ) => state.setDetail(slot.name, event.target.value)}
                        />

                    ))}

                    {confirmation.challenge ? (

                        <ConfirmCode
                            id={confirmation.id} challenge={confirmation.challenge} code={confirmation.code} retry={confirmation.retry}
                            expired={confirmation.expired} disabled={state.pending} onCode={confirmation.setCode}
                            onResend={() => { void state.submit(true); }}
                        />

                    ) : null}

                    <FormFeedback id={form.id("failure")} error={state.error} />

                    <Button type="submit" width="full" size="large" pending={state.pending}><Icon name="payout" />{t("withdraw")}</Button>

                </Form>

            )}

        </Dialog>

    );

}
