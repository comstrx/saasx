"use client";

import Field from "@/elements/field";
import Fieldset from "@/elements/fieldset";
import Grid from "@/elements/grid";
import Stack from "@/elements/stack";
import Text from "@/elements/text";
import { useTranslations } from "@/lib/providers/intl";

type Props = {
    id: string; label: string; hint?: string; error?: string; disabled?: boolean;
    latitude: string; longitude: string; onChange: ( value: { latitude?: string; longitude?: string } ) => void;
};

export default function CoordinateFields ({ id, label, hint, error, disabled, latitude, longitude, onChange }: Props) {

    const t = useTranslations("intake");

    return (

        <Fieldset legend={label} disabled={disabled}>

            <Stack gap={3}>

                {hint ? <Text size="small" tone="muted">{hint}</Text> : null}

                <Grid as="div" columns={2} gap={4}>

                    <Field
                        id={id} label={t("latitude")} value={latitude} inputMode="decimal" dir="ltr" error={error}
                        aria-describedby={`${id}-help`} onChange={( event ) => onChange({ latitude: event.target.value })}
                    />
                    <Field
                        id={`${id}-longitude`} label={t("longitude")} value={longitude} inputMode="decimal" dir="ltr"
                        aria-describedby={`${id}-help`} onChange={( event ) => onChange({ longitude: event.target.value })}
                    />

                </Grid>

                <Text id={`${id}-help`} size="small" tone="muted">{t("coordinates")}</Text>

            </Stack>

        </Fieldset>

    );

}
