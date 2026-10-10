"use client";

import Divider from "@/elements/divider";
import Field from "@/elements/field";
import Select from "@/elements/select";
import Stack from "@/elements/stack";
import Stepper from "@/elements/stepper";
import Surface from "@/elements/surface";
import { useBookingFields } from "@/hooks/use-booking-fields";
import type { BookingRules, BookingValues } from "@/lib/std/checkout";
import DatePicker from "./date-picker";
import FormFeedback from "./form-feedback";

type Props = {
    values: BookingValues; rules: BookingRules; errors: Record<string, string>; tiers: readonly string[];
    today: string; disabled?: boolean; id: ( field: string ) => string; onChange: ( patch: Partial<BookingValues> ) => void;
};

export default function BookingFields ({ values, rules, errors, tiers, today, disabled, id, onChange }: Props) {

    const data = useBookingFields(values, rules, today, onChange);
    const { t } = data;
    const dateError = errors.starts_at ?? errors.ends_at;

    return (

        <Stack gap={5}>

            {rules.dated && rules.fixed ? (

                <Field id={id("starts_at")} label={t("date")} type="date" value={values.starts_at} error={errors.starts_at} readOnly />

            ) : rules.dated ? (

                <Stack gap={2}>

                    <DatePicker
                        id={id("starts_at")} invalid={!!dateError} describedBy={dateError ? id("dates-error") : undefined}
                        locale={data.locale} label={data.label} summary={data.summary} empty={!data.range.from}
                        clear={data.search("clearDates")} done={data.search("done")}
                        value={data.range} minimum={data.minimum} mode={rules.range ? "range" : "single"} look="box"
                        open={data.open && !disabled} onOpenChange={data.setOpen} onChange={data.choose}
                    />

                    {dateError ? <FormFeedback id={id("dates-error")} error={dateError} /> : null}

                </Stack>

            ) : null}

            <Surface tone="clear" elevation="none" padding={4} radius="md">

                <Stack gap={4}>

                    {data.counts.map(( name, index ) => (

                        <Stack key={name} gap={4}>

                            {index ? <Divider /> : null}

                            <Stepper
                                label={t(name === "quantity" && rules.insured ? "peopleCount" : name)}
                                value={Number(values[name]) || 0}
                                minimum={name === "quantity" ? rules.minimum : name === "adults" ? 1 : 0}
                                maximum={rules.maximum}
                                decrease={t("less", { label: t(name) })}
                                increase={t("more", { label: t(name) })}
                                disabled={disabled}
                                onChange={( value ) => onChange({ [name]: String(value) })}
                            />

                            {errors[name] ? <FormFeedback id={id(name)} error={errors[name]} /> : null}

                        </Stack>

                    ))}

                </Stack>

            </Surface>

            {tiers.length ? (

                <Select
                    id={id("tier")} label={t("tier")} value={values.tier} disabled={disabled}
                    options={[{ value: "", label: t("defaultTier") }, ...tiers.map(( tier ) => ({ value: tier, label: tier }))]}
                    onValueChange={( value ) => onChange({ tier: value })}
                />

            ) : null}

        </Stack>

    );

}
