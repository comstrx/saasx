"use client";

import Button from "@/elements/button";
import Selectable from "@/elements/selectable";
import Stack from "@/elements/stack";
import Text from "@/elements/text";
import type { useBookingExtras } from "@/hooks/use-booking-extras";
import { useLocale, useTranslations } from "@/lib/providers/intl";
import { extraKey } from "@/lib/std/extras";
import { money } from "@/lib/std/format";
import ExtraFields from "./extra-fields";
import FormSection from "./form-section";

type Props = {
    extras: ReturnType<typeof useBookingExtras>; today: string; errors: Record<string, string>;
    currency?: string | null; disabled?: boolean;
    id: ( key: string ) => string; onChange: ( values: Record<string, string> ) => void;
};

export default function BookingExtras ({ extras, today, errors, currency, disabled, id, onChange }: Props) {

    const t = useTranslations("extras");
    const locale = useLocale();
    const failed = extras.parent.error || extras.details.error;
    const loading = extras.parent.loading || extras.details.loading;

    if ( !extras.options.length && !extras.parent.loading && !extras.parent.error && !extras.selected.length ) return null;

    return (

        <FormSection title={t("title")} description={t("description")}>

            <Stack id={id("addons")} tabIndex={-1} gap={4}>

                {loading ? <Text role="status" size="small" tone="muted">{t("loading")}</Text> : null}
                {failed ? <Stack gap={2}>

                    <Text role="alert" size="small" tone="danger">{t("failed")}</Text>
                    <Button variant="outlined" disabled={disabled} onClick={() => {

                        if ( extras.parent.error ) extras.parent.reload();
                        if ( extras.details.error ) extras.details.reload();

                    }}>{t("retry")}</Button>

                </Stack> : null}
                {errors.addons && !failed && !loading ? <Text role="alert" size="small" tone="danger">{errors.addons}</Text> : null}
                {extras.options.map(( option ) => {

                    const selected = extras.selected.includes(option.id);
                    const row = extras.rows.find(( item ) => item.product.id === option.id);
                    const price = money(option.price, locale, currency ?? "USD");

                    return (

                        <Selectable
                            key={option.id} id={id(extraKey(option.id, "selected"))} label={option.name || t("item")}
                            selected={selected} disabled={disabled}
                            onChange={( checked ) => onChange({ [extraKey(option.id, "selected")]: checked ? "yes" : "no" })}
                            detail={price ? <Text as="span" size="small" tone="muted">{t("from", {
                                amount: `⁨${price.number} ${price.currency}⁩`,
                            })}</Text> : undefined}
                        >

                            {selected && row ? (

                                <ExtraFields
                                    productId={option.id} state={row} today={today} errors={errors} disabled={disabled}
                                    id={id} onChange={onChange} reportSlot={extras.reportSlot}
                                />

                            ) : null}

                        </Selectable>

                    );

                })}
                {extras.selected.length ? (

                    <Button variant="ghost" disabled={disabled} onClick={() => onChange(Object.fromEntries(extras.selected
                        .map(( selected ) => [extraKey(selected, "selected"), "no"])))}>{t("clear")}</Button>

                ) : null}

            </Stack>

        </FormSection>

    );

}
