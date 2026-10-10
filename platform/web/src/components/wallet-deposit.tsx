"use client";

import Button from "@/elements/button";
import Choices from "@/elements/choices";
import Dialog from "@/elements/dialog";
import Field from "@/elements/field";
import Form from "@/elements/form";
import Stack from "@/elements/stack";
import Text from "@/elements/text";
import Thumb from "@/elements/thumb";
import { useWalletDeposit } from "@/hooks/use-wallet-deposit";
import Icon from "@/icons/icon";
import FormFeedback from "./form-feedback";
import SectionSkeleton from "./section-skeleton";

type Props = { open: boolean; currency: string; close: string; onOpenChange: ( open: boolean ) => void };

export default function WalletDeposit ({ open, currency, close, onOpenChange }: Props) {

    const state = useWalletDeposit(currency, open);
    const { t, form } = state;

    return (

        <Dialog
            open={open} onOpenChange={( next ) => { if ( !next ) state.reset(); onOpenChange(next); }}
            title={t("depositTitle")} description={t("depositHint")} close={close}
        >

            {state.loading ? <SectionSkeleton /> : !state.options.length ? <Text tone="muted">{t("noGateways")}</Text> : state.manual ? (

                <Stack gap={4}>

                    <Text>{t("depositPending")}</Text>

                    <Button onClick={() => onOpenChange(false)}>{t("done")}</Button>

                </Stack>

            ) : (

                <Form pending={state.pending} noValidate onSubmit={( event ) => { event.preventDefault(); void state.submit(); }}>

                    <Field
                        id={form.id("amount")} label={t("amount")} inputMode="decimal" value={form.values.amount} error={form.errors.amount}
                        end={<Text as="span" size="small" tone="muted">{currency}</Text>} disabled={state.pending}
                        onChange={( event ) => form.change({ amount: event.target.value })}
                    />

                    <Choices
                        label={t("gateway")} labelVisible value={form.values.gateway} disabled={state.pending}
                        options={state.options.map(( option ) => ({
                            value: option.value, label: option.label, detail: option.detail,
                            end: option.image
                                ? <Thumb src={option.image} alt="" fallback={<Icon name="card" />} />
                                : <Icon name="card" tone="muted" />,
                        }))}
                        onValueChange={( value ) => form.change({ gateway: value })}
                    />

                    {form.errors.gateway ? <FormFeedback id={form.id("gateway")} error={form.errors.gateway} /> : null}

                    <FormFeedback id={form.id("failure")} error={state.error} />

                    <Button type="submit" width="full" size="large" pending={state.pending}><Icon name="lock" />{t("deposit")}</Button>

                </Form>

            )}

        </Dialog>

    );

}
