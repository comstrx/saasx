"use client";

import Field from "@/elements/field";
import Grid from "@/elements/grid";
import Select from "@/elements/select";
import Stack from "@/elements/stack";
import { useTranslations } from "@/lib/providers/intl";
import type { Applicant } from "@/lib/std/applicants";

type Props = {
    value: Applicant; prefix: string; today: string; disabled?: boolean; nameHint?: boolean; errors: Record<string, string>;
    countries: readonly { value: string; label: string }[];
    id: ( field: string ) => string; onChange: ( patch: Record<string, string> ) => void;
};

export default function ApplicantFields ({
    value, prefix, today, disabled, nameHint = true, errors, countries, id, onChange,
}: Props) {

    const t = useTranslations("checkout");

    return (

        <Stack gap={4}>

            <Field
                id={id(`${prefix}.name`)} label={t("applicantName")} hint={nameHint ? t("applicantNameHint") : undefined}
                value={value.name} error={errors[`${prefix}.name`]} required maxLength={200} disabled={disabled}
                autoComplete="off" dir="auto" onChange={( event ) => onChange({ [`${prefix}.name`]: event.target.value })}
            />
            <Field
                id={id(`${prefix}.birth_date`)} label={t("birthDate")} type="date" max={today}
                value={value.birth_date} error={errors[`${prefix}.birth_date`]} required disabled={disabled}
                autoComplete="off" onChange={( event ) => onChange({ [`${prefix}.birth_date`]: event.target.value })}
            />

            <Grid as="div" columns={2} gap={4} align="end">

                {(["nationality", "residency"] as const).map(( key ) => (

                    <Select
                        key={key} id={id(`${prefix}.${key}`)} label={t(key)} value={value[key] ?? ""}
                        options={[{ value: "", label: t("notSpecified") }, ...countries]}
                        error={errors[`${prefix}.${key}`]} disabled={disabled}
                        onValueChange={( value ) => onChange({ [`${prefix}.${key}`]: value })}
                    />

                ))}

            </Grid>

        </Stack>

    );

}
