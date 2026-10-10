"use client";

import FormFeedback from "@/components/form-feedback";
import Button from "@/elements/button";
import Field from "@/elements/field";
import Form from "@/elements/form";
import Grid from "@/elements/grid";
import Select from "@/elements/select";
import Stack from "@/elements/stack";
import { useAccountAddress } from "@/hooks/use-account-address";
import type { AccountPlace } from "@/lib/std/account";

type Props = { place?: AccountPlace | null };

export default function AccountAddress ({ place }: Props) {

    const data = useAccountAddress(place);
    const { t } = data;
    const attributes = {
        country: ["country-name", 100], city: ["address-level2", 100], address: ["address-line1", 500],
        address_2: ["address-line2", 500], zip_code: ["postal-code", 40],
    } as const;

    return (

        <Form noValidate pending={data.pending} onSubmit={( event ) => { event.preventDefault(); void data.submit(); }}>

            <Grid as="div" columns={2} gap={4}>

                <Select id={data.id("country")} label={t("country")} autoComplete="country"
                    value={data.values.country} options={data.countries} disabled={data.pending} error={data.errors.country}
                    onValueChange={( value ) => data.change({ country: value })} />
                <Field id={data.id("city")} label={t("city")} value={data.values.city} dir="auto"
                    autoComplete="address-level2" maxLength={100} disabled={data.pending} error={data.errors.city}
                    onChange={( event ) => data.change({ city: event.target.value })} />

            </Grid>
            {(["address", "address_2", "zip_code"] as const).map(( key ) => (

                <Field key={key} id={data.id(key)} label={t(key)} value={data.values[key]} dir="auto"
                    autoComplete={attributes[key][0]} maxLength={attributes[key][1]} disabled={data.pending}
                    error={data.errors[key]} onChange={( event ) => data.change({ [key]: event.target.value })} />

            ))}
            <Stack direction="row" gap={3} wrap align="center">

                <Button id={data.id("save")} type="submit" pending={data.pending} disabled={!data.dirty && !data.error}>

                    {t(data.pending ? "saving" : "saveAddress")}

                </Button>
                <FormFeedback id={data.id("failure")} error={data.error} message={data.success ? t("addressSaved") : null} />

            </Stack>

        </Form>

    );

}
