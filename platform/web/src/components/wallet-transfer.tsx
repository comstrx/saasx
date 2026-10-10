"use client";

import Button from "@/elements/button";
import Dialog from "@/elements/dialog";
import Field from "@/elements/field";
import Form from "@/elements/form";
import Portrait from "@/elements/portrait";
import Stack from "@/elements/stack";
import Surface from "@/elements/surface";
import Text from "@/elements/text";
import { useWalletTransfer } from "@/hooks/use-wallet-transfer";
import Icon from "@/icons/icon";
import { initials } from "@/lib/std/text";
import ConfirmCode from "./confirm-code";
import FormFeedback from "./form-feedback";

type Props = { open: boolean; currency: string; close: string; onOpenChange: ( open: boolean ) => void; onDone: () => void };

export default function WalletTransfer ({ open, currency, close, onOpenChange, onDone }: Props) {

    const state = useWalletTransfer(onDone);
    const { t, form, person, confirmation } = state;

    return (

        <Dialog
            open={open} onOpenChange={( next ) => { if ( !next ) state.reset(); onOpenChange(next); }}
            title={t("transferTitle")} description={t("transferHint")} close={close} dismissible={!state.pending}
        >

            {state.done ? (

                <Stack gap={4} align="center">

                    <Icon name="check-circle" size="xl" tone="accent" />

                    <Text align="center">{t("sent")}</Text>

                    <Button width="full" onClick={() => onOpenChange(false)}>{t("done")}</Button>

                </Stack>

            ) : (

                <Form
                    pending={state.pending} noValidate
                    onSubmit={( event ) => { event.preventDefault(); void (person ? state.send() : state.find()); }}
                >

                    {person ? (

                        <Surface tone="track" elevation="none" padding={4} radius="md">

                            <Stack direction="row" align="center" justify="between" gap={3}>

                                <Stack direction="row" align="center" gap={3}>

                                    <Portrait size="small" alt={person.name} initials={initials(person.name)} />

                                    <Stack gap={0}>

                                        <Text size="label" tone="muted">{t("recipientFound")}</Text>

                                        <Text weight="semibold" dir="auto">{person.name}</Text>

                                    </Stack>

                                </Stack>

                                <Button variant="ghost" size="small" disabled={state.pending} onClick={state.change}>{t("change")}</Button>

                            </Stack>

                        </Surface>

                    ) : (

                        <Field
                            id={form.id("recipient")} label={t("recipient")} hint={t("findHint")} value={form.values.recipient}
                            error={form.errors.recipient} autoComplete="off" dir="auto" disabled={state.pending}
                            start={<Icon name="search" tone="muted" />}
                            onChange={( event ) => form.change({ recipient: event.target.value })}
                        />

                    )}

                    {person ? (

                        <Field
                            id={form.id("amount")} label={t("amount")} inputMode="decimal" value={form.values.amount}
                            error={form.errors.amount} disabled={state.pending}
                            end={<Text as="span" size="small" tone="muted">{currency}</Text>}
                            onChange={( event ) => form.change({ amount: event.target.value })}
                        />

                    ) : null}

                    {person && confirmation.challenge ? (

                        <ConfirmCode
                            id={confirmation.id} challenge={confirmation.challenge} code={confirmation.code} retry={confirmation.retry}
                            expired={confirmation.expired} disabled={state.pending} onCode={confirmation.setCode}
                            onResend={() => { void state.send(true); }}
                        />

                    ) : null}

                    <FormFeedback id={form.id("failure")} error={state.failure} />

                    <Button type="submit" width="full" size="large" pending={state.pending}>

                        {person ? <><Icon name="share" />{t("send")}</> : <><Icon name="search" />{t("find")}</>}

                    </Button>

                </Form>

            )}

        </Dialog>

    );

}
