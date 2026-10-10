"use client";

import FormFeedback from "@/components/form-feedback";
import PasswordField from "@/components/password-field";
import PasswordFields from "@/components/password-fields";
import PhoneField from "@/components/phone-field";
import Button from "@/elements/button";
import Field from "@/elements/field";
import Form from "@/elements/form";
import Link from "@/elements/link";
import Segmented from "@/elements/segmented";
import Spinner from "@/elements/spinner";
import Stack from "@/elements/stack";
import { useTranslations } from "@/lib/providers/intl";
import type { AuthValues } from "@/lib/std/auth";

type Props = {
    mode: "login" | "register" | "recover"; values: AuthValues; errors: Record<string, string>;
    pending: boolean; error: string | null; passwordHint: string; recover: string;
    id: ( field: string ) => string; onChange: ( patch: Partial<AuthValues> ) => void; onSubmit: () => void;
};

export default function CredentialsForm ({ mode, values, errors, pending, error, passwordHint, recover, id, onChange, onSubmit }: Props) {

    const t = useTranslations("auth");
    const action = mode === "register" ? "register" : mode === "recover" ? "sendCode" : "signIn";
    const working = mode === "register" ? "registering" : mode === "recover" ? "sending" : "signingIn";

    return (

        <Form pending={pending} noValidate onSubmit={( event ) => { event.preventDefault(); onSubmit(); }}>

            {mode !== "register" ? (

                <Segmented
                    label={t("method")} value={values.method} disabled={pending}
                    options={[{ value: "phone", label: t("phone") }, { value: "email", label: t("email") }]}
                    onValueChange={( method ) => onChange({ method })}
                />

            ) : (

                <Field
                    id={id("name")} label={t("name")} autoComplete="name" value={values.name} maxLength={200}
                    error={errors.name} disabled={pending} onChange={( event ) => onChange({ name: event.target.value })}
                />

            )}

            {values.method === "email" || mode === "register" ? (

                <Field
                    id={id("email")} label={t("email")} type="email" autoComplete="email" autoCapitalize="none"
                    spellCheck={false} dir="ltr" value={values.email} error={errors.email} disabled={pending}
                    onChange={( event ) => onChange({ email: event.target.value })}
                />

            ) : null}

            {values.method === "phone" || mode === "register" ? (

                <PhoneField
                    id={id("phone")} value={{ country: values.country, number: values.phone }} error={errors.phone}
                    disabled={pending} onChange={( phone ) => onChange({ phone: phone.number, country: phone.country })}
                />

            ) : null}

            {mode === "register" ? (

                <PasswordFields
                    id={id} password={values.password} confirm={values.confirm} errors={errors}
                    hint={passwordHint} disabled={pending} onChange={onChange}
                />

            ) : mode === "login" ? (

                <Stack gap={1}>

                    <PasswordField
                        id={id("password")} label={t("password")} autoComplete="current-password"
                        value={values.password} error={errors.password} disabled={pending}
                        onChange={( event ) => onChange({ password: event.target.value })}
                    />

                    <Stack align="end" gap={0}><Link href={recover} variant="nav">{t("forgot")}</Link></Stack>

                </Stack>

            ) : null}

            {mode === "register" ? (

                <Field
                    id={id("promotion")} label={`${t("promotion")} ${t("optional")}`} autoCapitalize="none"
                    value={values.promotion} maxLength={64} error={errors.promotion_code} disabled={pending}
                    onChange={( event ) => onChange({ promotion: event.target.value })}
                />

            ) : null}

            {error ? <FormFeedback id={id("failure")} error={error} /> : null}

            <Button type="submit" width="full" size="large" pending={pending}>

                {pending ? <Spinner size="small" tone="inherit" label={t(working)} /> : null}
                {t(pending ? working : action)}

            </Button>

        </Form>

    );

}
