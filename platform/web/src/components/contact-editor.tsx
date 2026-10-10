"use client";

import FormFeedback from "@/components/form-feedback";
import PasswordField from "@/components/password-field";
import PhoneField from "@/components/phone-field";
import Button from "@/elements/button";
import Emblem from "@/elements/emblem";
import Field from "@/elements/field";
import Form from "@/elements/form";
import Link from "@/elements/link";
import OtpInput from "@/elements/otp-input";
import Stack from "@/elements/stack";
import Status from "@/elements/status";
import Text from "@/elements/text";
import { useContactEditor } from "@/hooks/use-contact-editor";
import Icon from "@/icons/icon";
import type { ContactField } from "@/lib/std/contact-verification";

type Props = {
    field: ContactField; value?: string | null; verified?: boolean | null; hasPassword: boolean; recover: string; country: string;
};

export default function ContactEditor ({ field, value, verified, hasPassword, recover, country }: Props) {

    const data = useContactEditor({ field, value, hasPassword, country });
    const { t, auth, challenge } = data;

    return (

        <Stack gap={4} role="group" aria-label={t(field)}>

            <Stack direction="responsive" gap={4} justify="between">

                <Stack direction="row" gap={3} grow>

                    <Emblem size="small" tone="neutral"><Icon name={field === "email" ? "mail" : "phone"} /></Emblem>
                    <Stack gap={1} grow>

                        <Text weight="semibold">{t(field)}</Text>
                        <Text wrap="anywhere" tone={value ? "ink" : "muted"}>
                            <Text as="span" dir={value ? "ltr" : undefined}>{value || t("notAdded")}</Text>
                        </Text>
                        {value ? <Stack direction="row">

                            <Status
                                tone={verified ? "positive" : "attention"}
                                icon={<Icon name={verified ? "seal" : "warning-circle"} size="sm" />}
                            >
                                {t(verified ? "verifiedLabel" : "unverifiedLabel")}
                            </Status>

                        </Stack> : null}

                    </Stack>

                </Stack>
                {data.phase === "idle" ? (

                    <Stack direction="row" wrap gap={2} align="start">

                        {value && !verified ? <Button variant="ghost" size="small" pending={data.busy} disabled={data.retry > 0}
                            aria-label={t("verifyContact", { label: t(field) })} onClick={() => { void data.verify(); }}>
                            {t(data.uncertain ? "retry" : "verifyCurrent")}
                        </Button> : null}
                        {field === "email" && !hasPassword
                            ? <Link href={recover} variant="outlined" size="small">{t("setPassword")}</Link>
                            : <Button variant="outlined" size="small" disabled={data.locked}
                                aria-label={t("editContact", { label: t(field) })} onClick={data.edit}>{t("edit")}</Button>}

                    </Stack>

                ) : null}

            </Stack>

            {data.phase === "idle" && field === "email" && !hasPassword
                ? <Text size="small" tone="muted">{t("passwordFirst")}</Text> : null}
            {data.phase === "idle" ? null : data.phase === "edit" ? (

                <Form pending={data.busy} noValidate onSubmit={( event ) => { event.preventDefault(); void data.send(); }}>

                    {field === "email" ? (

                        <Field id={data.id("value")} label={t("newEmail")} type="email" autoComplete="email" dir="ltr"
                            value={data.values.value} error={data.errors.value ?? data.errors.email} disabled={data.locked}
                            autoCapitalize="none" spellCheck={false} maxLength={254}
                            onChange={( event ) => data.change({ value: event.target.value })} />

                    ) : (

                        <PhoneField id={data.id("value")} value={{ country: data.values.country, number: data.values.value }}
                            error={data.errors.value ?? data.errors.phone} disabled={data.locked}
                            onChange={( next ) => data.change({ value: next.number, country: next.country })} />

                    )}

                    {hasPassword ? <PasswordField
                        id={data.id("password")} label={t("password")} autoComplete="current-password"
                        value={data.values.password} error={data.errors.password} disabled={data.locked}
                        onChange={( event ) => data.change({ password: event.target.value })}
                    /> : null}

                    <Text size="small" tone="muted">{t("changeHint")}</Text>

                    <Stack direction="row" wrap gap={2}>

                        <Button type="submit" pending={data.busy} disabled={data.retry > 0}>
                            {t(data.busy ? "sending" : data.uncertain ? "retry" : "sendCode")}
                        </Button>
                        <Button variant="ghost" disabled={data.locked} onClick={data.cancel}>{t("cancel")}</Button>

                    </Stack>

                </Form>

            ) : challenge ? (

                <Form pending={data.busy} noValidate onSubmit={( event ) => {

                    event.preventDefault();
                    void (data.uncertain ? data.resume() : data.confirm());

                }}>

                    <Text size="small" tone="muted">{t(data.mode === "change"
                        ? `sentChange.${challenge.channel}` : `sentVerify.${challenge.channel}`)}</Text>
                    {data.mode === "change" ? <Text size="small">{t("pendingTarget", {
                        value: `\u2068${data.target}\u2069`,
                    })}</Text> : null}

                    {data.expired ? <FormFeedback id={data.id("code")} error={t("expired")} /> : <OtpInput
                        id={data.id("code")} label={auth("otpLabel")} hint={auth("otpHint")} length={challenge.length}
                        value={data.values.code} disabled={data.locked} error={data.errors.code}
                        slotLabel={( index ) => auth("otpSlot", { index, length: challenge.length })}
                        onValueChange={( code ) => data.change({ code })}
                    />}

                    <Stack direction="row" wrap gap={2}>

                        {!data.expired ? <Button type="submit" pending={data.busy}>
                            {t(data.busy ? "confirming" : data.uncertain ? "retry" : "confirm")}
                        </Button> : null}
                        <Button variant="outlined" disabled={data.locked || data.retry > 0}
                            onClick={() => { void data.resend(); }}>{t("resend")}</Button>
                        <Button variant="ghost" disabled={data.locked} onClick={data.cancel}>{t("close")}</Button>

                    </Stack>

                </Form>

            ) : null}

            {data.retry > 0 ? <Text size="small" tone="muted">{t("retryIn", { seconds: data.retry })}</Text> : null}
            {data.uncertain ? <Text size="small" tone="muted">{t("uncertain")}</Text> : null}
            <FormFeedback id={data.id("failure")} error={data.error} />
            <FormFeedback id={data.id("status")} message={data.notice} />

        </Stack>

    );

}
