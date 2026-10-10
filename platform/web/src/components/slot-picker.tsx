"use client";

import Button from "@/elements/button";
import Select from "@/elements/select";
import Stack from "@/elements/stack";
import Text from "@/elements/text";
import { useTranslations } from "@/lib/providers/intl";

type Props = {
    id: string; value: string; error?: string; disabled?: boolean; active: boolean;
    loading: boolean; failed: boolean; slotted: boolean; known: boolean; open: boolean;
    options: readonly { value: string; label: string; disabled: boolean }[];
    reload: () => void; onChange: ( value: string ) => void;
};

export default function SlotPicker ({
    id, value, error, disabled, active, loading, failed, slotted, known, open, options, reload, onChange,
}: Props) {

    const t = useTranslations("checkout");
    const common = useTranslations("common");

    if ( !active ) return null;

    return (

        <Stack gap={3}>

            {loading ? <Text size="small" tone="muted" role="status">{t("slotsLoading")}</Text>
                : failed ? <Text size="small" tone="danger" role="alert">{t("slotsFailed")}</Text>
                : !known ? <Text size="small" tone="muted" role="status">{t("slotsUnknown")}</Text>
                : !open ? <Text size="small" tone="muted" role="status">{t("slotsEmpty")}</Text> : null}

            {!loading && !failed && slotted && options.length ? (

                <Select
                    id={id} label={t("appointmentTime")} hint={t("publishedTimes")}
                    value={options.some(( option ) => option.value === value) ? value : ""}
                    options={[{ value: "", label: t("chooseSlot") }, ...options]}
                    disabled={disabled} error={error} onValueChange={( value ) => onChange(value)}
                />

            ) : !loading && !failed && open ? <Text size="small" tone="muted">{t("dayAvailable")}</Text> : null}

            {failed || !loading && !open ? (

                <Button variant="outlined" disabled={disabled} onClick={reload}>{common("retry")}</Button>

            ) : null}

        </Stack>

    );

}
