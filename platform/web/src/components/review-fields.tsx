"use client";

import Accordion from "@/elements/accordion";
import Field from "@/elements/field";
import RatingInput from "@/elements/rating-input";
import Stack from "@/elements/stack";
import Textarea from "@/elements/textarea";
import { useTranslations } from "@/lib/providers/intl";
import type { ReviewAspect } from "@/lib/std/feedback";

type Props = {
    values: Record<string, string>; errors: Record<string, string>; aspects: readonly ReviewAspect[];
    disabled?: boolean; optionalRating?: boolean; ratingHint?: string;
    id: ( key: string ) => string; onChange: ( patch: Record<string, string> ) => void;
};

export default function ReviewFields ({ values, errors, aspects, disabled, optionalRating, ratingHint, id, onChange }: Props) {

    const t = useTranslations("feedback");
    const aspect = useTranslations("feedback.aspects");
    const options = [1, 2, 3, 4, 5].map(( value ) => ({ value: String(value), label: t("stars", { count: value }) }));

    return (

        <Stack gap={5}>

            <RatingInput
                id={id("rating")} label={t(optionalRating ? "newRating" : "overall")} value={values.rating ?? ""} options={options}
                hint={ratingHint ?? t("ratingHint")} clearLabel={optionalRating ? t("clearScore") : undefined}
                error={errors.rating} disabled={disabled} onChange={( value ) => onChange({ rating: value })}
            />
            {aspects.length ? <Accordion
                items={[{
                    key: "criteria", title: t("criteria"), open: aspects.some(( name ) => !!errors[`scores.${name}`]),
                    body: <Stack gap={5}>

                        {aspects.map(( name ) => <RatingInput
                            key={name} id={id(`scores.${name}`)} label={t("optionalAspect", { name: aspect(name) })}
                            value={values[`scores.${name}`] ?? ""} options={options} clearLabel={t("clearScore")}
                            error={errors[`scores.${name}`]} disabled={disabled}
                            onChange={( value ) => onChange({ [`scores.${name}`]: value })}
                        />)}

                    </Stack>,
                }]}
            /> : null}
            <Field
                id={id("title")} label={t("headline")} value={values.title ?? ""} maxLength={255} dir="auto"
                disabled={disabled} error={errors.title} onChange={( event ) => onChange({ title: event.target.value })}
            />
            <Textarea
                id={id("content")} label={t("content")} hint={t("contentHint")} value={values.content ?? ""} maxLength={65535}
                rows={5} dir="auto" disabled={disabled} error={errors.content}
                onChange={( event ) => onChange({ content: event.target.value })}
            />

        </Stack>

    );

}
