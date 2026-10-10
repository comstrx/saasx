"use client";

import Divider from "@/elements/divider";
import Fieldset from "@/elements/fieldset";
import Select from "@/elements/select";
import Stack from "@/elements/stack";
import Text from "@/elements/text";
import { useCountryOptions } from "@/hooks/use-country-options";
import { useLocale, useTranslations } from "@/lib/providers/intl";
import type { Applicant } from "@/lib/std/applicants";
import ApplicantFields from "./applicant-fields";
import FormSection from "./form-section";

type Props = {
    rows: readonly Applicant[]; required: boolean; enabled: boolean; disabled?: boolean;
    today: string; errors: Record<string, string>;
    id: ( field: string ) => string; onChange: ( patch: Record<string, string> ) => void;
};

export default function ApplicantList ({ rows, required, enabled, disabled, today, errors, id, onChange }: Props) {

    const t = useTranslations("checkout");
    const countries = useCountryOptions(useLocale());

    return (

        <FormSection title={t("travellers")} description={t(required ? "travellersRequired" : "travellersOptional")}>

            {!required ? (

                <Select
                    id={id("applicant_details")} label={t("includeTravellers")} value={enabled ? "yes" : "no"} disabled={disabled}
                    options={[{ value: "no", label: t("withoutDetails") }, { value: "yes", label: t("withDetails") }]}
                    onValueChange={( value ) => onChange({ applicant_details: value })}
                />

            ) : null}

            {enabled ? <Text size="small" tone="muted">{t("applicantNameHint")}</Text> : null}

            {rows.map(( value, index ) => (

                <Stack key={id(`applicants.${index}`)} gap={4}>

                    {index > 0 ? <Divider /> : null}

                    <Fieldset legend={t("traveller", { index: index + 1 })} disabled={disabled}>

                        <ApplicantFields
                            value={value} prefix={`applicants.${index}`} countries={countries} today={today}
                            errors={errors} id={id} onChange={onChange} disabled={disabled} nameHint={false}
                        />

                    </Fieldset>

                </Stack>

            ))}

        </FormSection>

    );

}
