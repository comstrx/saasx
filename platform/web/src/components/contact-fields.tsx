"use client";

import Field from "@/elements/field";
import Grid from "@/elements/grid";
import Select from "@/elements/select";
import Stack from "@/elements/stack";
import { useLocale, useTranslations } from "@/lib/providers/intl";
import { useSite } from "@/lib/site/context";
import { languageName } from "@/lib/std/locale";
import { asciiNumber } from "@/lib/std/number";

type Props = {
    values: Readonly<Record<string, string>>; errors: Readonly<Record<string, string>>; disabled?: boolean;
    id: ( field: string ) => string; onChange: ( patch: Record<string, string> ) => void;
};

export default function ContactFields ({ values, errors, disabled, id, onChange }: Props) {

    const t = useTranslations("contact");
    const { settings } = useSite();
    const locale = useLocale();
    const languages = [...new Set([...settings.locale.enabled, ...(values.language ? [values.language] : [])])];

    return (

        <Stack gap={4}>

            <Field
                id={id("name")} label={t("name")} autoComplete="name" maxLength={200} value={values.name ?? ""}
                error={errors.name} disabled={disabled} dir="auto" onChange={( event ) => onChange({ name: event.target.value })}
            />
            <Grid as="div" columns={2} gap={4}>

                <Field
                    id={id("email")} label={t("email")} type="email" autoComplete="email" maxLength={255} value={values.email ?? ""}
                    error={errors.email} disabled={disabled} dir="ltr" onChange={( event ) => onChange({ email: event.target.value })}
                />
                <Field
                    id={id("phone")} label={t("phone")} type="tel" autoComplete="tel" maxLength={30} value={values.phone ?? ""}
                    error={errors.phone} disabled={disabled} dir="ltr" hint={t("phoneHint")}
                    onChange={( event ) => onChange({ phone: asciiNumber(event.target.value) })}
                />

            </Grid>
            <Select
                id={id("language")} label={t("language")} value={values.language ?? ""} disabled={disabled}
                options={[{ value: "", label: t("defaultLanguage") }, ...languages.map(( value ) => ({
                    value, label: languageName(value, locale),
                }))]}
                onValueChange={( value ) => onChange({ language: value })}
            />

        </Stack>

    );

}
