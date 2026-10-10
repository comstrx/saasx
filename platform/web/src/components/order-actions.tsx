"use client";

import type { Data } from "@/api/features";
import Button from "@/elements/button";
import Dialog from "@/elements/dialog";
import Field from "@/elements/field";
import Form from "@/elements/form";
import Grid from "@/elements/grid";
import Select from "@/elements/select";
import Stack from "@/elements/stack";
import Text from "@/elements/text";
import Textarea from "@/elements/textarea";
import { useOrderActions } from "@/hooks/use-order-actions";
import { asciiNumber } from "@/lib/std/number";
import FormFeedback from "./form-feedback";
import FormSection from "./form-section";

type Props = { order: Data<"orders", "view">; onChanged: () => void };

export default function OrderActions ({ order, onChanged }: Props) {

    const state = useOrderActions(order, onChanged);
    const { t, active, mutation, form, values } = state;
    const notes = active === "cancel" || active === "revise" || active === "return";
    const refundable = state.amount ? `\u2068${state.amount.number} ${state.amount.currency}\u2069` : null;
    const base = state.base ? `\u2068${state.base.number} ${state.base.currency}\u2069` : null;

    if ( !state.choices.length && !active && !state.done && !mutation.blocked ) return null;

    return (

        <FormSection title={t("title")}>

            <Grid as="div" columns={3} gap={4}>

                {state.choices.map(( action ) => (

                    <Button key={action} variant="outlined" width="full" disabled={mutation.locked} onClick={() => state.choose(action)}>

                        {t(`${action}.label`)}

                    </Button>

                ))}

            </Grid>
            <FormFeedback
                id={form.id("result")} message={state.done ? t(`${state.done}.success`) : null}
                error={!active && mutation.blocked ? state.message : null}
            />
            <Dialog
                open={!!active} onOpenChange={( open ) => { if ( !open ) state.close(); }}
                title={active ? t(`${active}.title`) : t("title")} close={t("back")}
                dismissible={!mutation.locked}
            >

                {active ? <Form
                    noValidate pending={mutation.pending} onSubmit={( event ) => { event.preventDefault(); void state.submit(); }}
                >

                    <Text tone="muted" size="small">{t(`${active}.description`)}</Text>
                    {active === "cancel" && order.lines?.length ? <Text size="small">{t("family")}</Text> : null}
                    {active === "refund" || active === "cancel" ? <Stack gap={2}>

                        {refundable && (active === "refund" || order.can_refund)
                            ? <Text weight="semibold">{t("refundable", { amount: refundable })}</Text> : null}
                        <Text size="small" tone="muted">{t("wallet")}</Text>
                        <Text size="small" tone="muted">{t(active === "cancel" ? "cancelEstimate" : "recalculated")}</Text>

                    </Stack> : null}
                    {active === "refund" ? <Stack gap={4}>

                        <Select
                            id={form.id("refund")} label={t("refundMode")} value={values.refund} disabled={mutation.locked}
                            options={[
                                { value: "full", label: t("full") },
                                ...(state.limit ? [{ value: "partial", label: t("partial") }] : []),
                            ]}
                            onValueChange={( value ) => form.change({ refund: value })}
                        />
                        {values.refund === "partial" ? <Field
                            id={form.id("amount")} label={t("amount")} hint={t("amountHint", { amount: base ?? "" })}
                            value={values.amount} inputMode="decimal" dir="ltr" error={form.errors.amount} disabled={mutation.locked}
                            onChange={( event ) => form.change({ amount: asciiNumber(event.target.value) })}
                        /> : null}

                    </Stack> : null}
                    {active === "return" ? <Field
                        id={form.id("quantity")} label={t("quantity")} hint={t("quantityHint", { quantity: state.quantity })}
                        value={values.quantity} inputMode="numeric" dir="ltr" error={form.errors.quantity} disabled={mutation.locked}
                        onChange={( event ) => form.change({ quantity: asciiNumber(event.target.value) })}
                    /> : null}
                    {active === "revise" && order.revisions_left != null ? <Text size="small">

                        {t("revisions", { count: order.revisions_left })}

                    </Text> : null}
                    {notes ? <Textarea
                        id={form.id("notes")} label={t(active === "revise" ? "revisionNotes" : "reason")} value={values.notes}
                        maxLength={3000} rows={3} dir="auto" error={form.errors.notes} disabled={mutation.locked}
                        onChange={( event ) => form.change({ notes: event.target.value })}
                    /> : null}
                    <FormFeedback id={form.id("failure")} error={state.message} />
                    <Stack gap={3}>

                        <Button variant="outlined" onClick={state.close} disabled={mutation.locked}>

                            {t(active === "cancel" ? "keep" : "back")}

                        </Button>
                        <Button
                            type="submit" pending={mutation.pending}
                            disabled={mutation.blocked || !mutation.ready || !state.available && !mutation.attempt}
                        >

                            {t(mutation.recovery ? "retry" : `${active}.confirm`)}

                        </Button>

                    </Stack>

                </Form> : null}

            </Dialog>

        </FormSection>

    );

}
