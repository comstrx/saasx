"use client";

import Field from "@/elements/field";
import Grid from "@/elements/grid";
import Stack from "@/elements/stack";
import Textarea from "@/elements/textarea";
import { useTranslations } from "@/lib/providers/intl";

type Props = {
    values: Readonly<Record<string, string>>; errors: Readonly<Record<string, string>>; disabled?: boolean;
    id: ( field: string ) => string; onChange: ( patch: Record<string, string> ) => void;
};

export default function AddressFields ({ values, errors, disabled, id, onChange }: Props) {

    const t = useTranslations("contact");
    const attributes = { country: "country-name", state: "address-level1", city: "address-level2", zip_code: "postal-code" } as const;

    return (

        <Stack gap={4}>

            <Textarea
                id={id("address")} label={t("address")} autoComplete="shipping street-address" rows={2} maxLength={255}
                value={values.address ?? ""} error={errors.address} disabled={disabled} dir="auto"
                onChange={( event ) => onChange({ address: event.target.value })}
            />
            <Grid as="div" columns={2} gap={4}>

                {(["country", "state", "city", "zip_code"] as const).map(( key ) => (

                    <Field
                        key={key} id={id(key)} label={t(key)} autoComplete={`shipping ${attributes[key]}`} maxLength={255}
                        value={values[key] ?? ""} error={errors[key]} disabled={disabled} dir="auto"
                        onChange={( event ) => onChange({ [key]: event.target.value })}
                    />

                ))}

            </Grid>

        </Stack>

    );

}
