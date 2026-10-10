"use client";

import Button from "@/elements/button";
import Emblem from "@/elements/emblem";
import Segmented from "@/elements/segmented";
import Stack from "@/elements/stack";
import Surface from "@/elements/surface";
import Text from "@/elements/text";
import Textarea from "@/elements/textarea";
import { usePurchaseContact } from "@/hooks/use-purchase-contact";
import Icon from "@/icons/icon";
import { useTranslations } from "@/lib/providers/intl";
import { contactKeys } from "@/lib/std/contact";
import AddressFields from "./address-fields";
import ContactFields from "./contact-fields";
import FormSection from "./form-section";

type Props = {
    values: Readonly<Record<string, string>>; errors: Readonly<Record<string, string>>; delivery?: string | null; disabled?: boolean;
    id: ( field: string ) => string; onChange: ( patch: Record<string, string> ) => void;
};

export default function PurchaseContact ({ values, errors, delivery, disabled, id, onChange }: Props) {

    const t = useTranslations("contact");
    const saved = usePurchaseContact({ values, onChange });
    const custom = values.contact_mode === "custom";
    const fields = {
        values: Object.fromEntries(contactKeys.map(( key ) => [key, values[`contact.${key}`] ?? ""])),
        errors: Object.fromEntries(contactKeys.map(( key ) => [key, errors[`contact.${key}`] ?? ""])),
        id: ( key: string ) => id(`contact.${key}`), disabled,
        onChange: ( patch: Record<string, string> ) => onChange(Object.fromEntries(Object.entries(patch)
            .map(( [key, value] ) => [`contact.${key}`, value]))),
    };
    const method = (["shipping", "pickup", "digital", "onsite"] as const).find(( value ) => value === delivery);

    return (

        <FormSection title={t(delivery === "shipping" ? "deliveryTitle" : "title")} description={t("description")}>

            {method ? <Text size="small" tone="muted">{t(`delivery.${method}`)}</Text> : null}
            <Segmented
                label={t("source")} value={custom ? "custom" : "account"} disabled={disabled}
                options={[
                    { value: "account", label: t("account"), icon: <Icon name="user-circle" /> },
                    { value: "custom", label: t("custom"), icon: <Icon name="edit" /> },
                ]}
                onValueChange={( value ) => saved.choose(value)}
            />
            {custom ? (

                <Stack gap={5}>

                    <Text size="small" tone="muted">{t("customHint")}</Text>
                    <ContactFields {...fields} />
                    <AddressFields {...fields} />

                </Stack>

            ) : saved.account.loading ? <Text role="status" size="small" tone="muted">{t("loading")}</Text>
                : saved.account.error ? (

                    <Stack gap={2}>

                        <Text role="alert" size="small" tone="danger">{t("failed")}</Text>
                        <Button variant="outlined" onClick={saved.account.reload} disabled={disabled}>{t("reload")}</Button>

                    </Stack>

                ) : (

                    <Surface tone="track" elevation="none" padding={4} radius="md">

                        <Stack direction="row" gap={3}>

                            <Emblem size="small" tone="neutral"><Icon name="user" /></Emblem>

                            <Stack gap={1}>

                                {saved.details.length ? saved.details.map(( [key, value], index ) => (

                                    <Text
                                        key={key} size={index ? "small" : "base"} weight={index ? "normal" : "semibold"}
                                        tone={index ? "muted" : "ink"} wrap="anywhere" dir="auto"
                                    >

                                        {value}

                                    </Text>

                                )) : <Text size="small" tone="muted">{t("noDetails")}</Text>}

                            </Stack>

                        </Stack>

                    </Surface>

                )}
            <Textarea
                id={id("notes")} label={t("notes")} hint={t("notesHint")} maxLength={255} rows={3}
                value={values.notes ?? ""} error={errors.notes} disabled={disabled} dir="auto"
                onChange={( event ) => onChange({ notes: event.target.value })}
            />

        </FormSection>

    );

}
