"use client";

import Checks from "@/elements/checks";
import Field from "@/elements/field";
import Select from "@/elements/select";
import Textarea from "@/elements/textarea";
import { useTranslations } from "@/lib/providers/intl";
import { type Question, selectedAnswers } from "@/lib/std/intake";
import CoordinateFields from "./coordinate-fields";
import FileChoice from "./file-choice";

type Props = {
    question: Question; field: string; id: string; label: string; error?: string; disabled?: boolean;
    values: Readonly<Record<string, string>>; onChange: ( value: Record<string, string> ) => void;
};

export default function QuestionField ({ question, field, id, label, error, disabled, values, onChange }: Props) {

    const t = useTranslations("intake");
    const value = values[field] ?? "";
    const change = ( answer: string ) => onChange({ [field]: answer });
    const props = { id, label, hint: question.hint ?? undefined, error, disabled };
    const choices = [...new Set((question.options ?? []).map(( option ) => option.trim()).filter(Boolean))];
    const options = choices.map(( option ) => ({ value: option, label: option }));

    if ( question.type === "file" ) return <FileChoice {...props} value={value} onChange={change} />;

    if ( question.type === "textarea" ) {

        return <Textarea {...props} value={value} maxLength={5000} dir="auto" onChange={( event ) => change(event.target.value)} />;

    }
    if ( question.type === "multi_select" ) {

        return (

            <Checks {...props} options={options} value={selectedAnswers(value)} onChange={( chosen ) => change(JSON.stringify(chosen))} />

        );

    }
    if ( question.type === "select" || question.type === "boolean" ) {

        const items = question.type === "boolean" ? [{ value: "true", label: t("yes") }, { value: "false", label: t("no") }] : options;

        return (

            <Select
                {...props} value={value} options={[{ value: "", label: t("choose") }, ...items]}
                onValueChange={( value ) => change(value)}
            />

        );

    }
    if ( question.type === "location" ) {

        return (

            <CoordinateFields
                {...props} latitude={values[`${field}.latitude`] ?? ""} longitude={values[`${field}.longitude`] ?? ""}
                onChange={( point ) => onChange(Object.fromEntries(Object.entries(point).map(( [key, coordinate] ) => [
                    `${field}.${key}`, coordinate,
                ])))}
            />

        );

    }

    const type = question.type === "phone" ? "tel"
        : ["email", "url", "date", "time"].includes(question.type ?? "") ? question.type : "text";
    const direction = ["phone", "email", "url", "number", "date", "time"].includes(question.type ?? "") ? "ltr" : "auto";

    return (

        <Field
            {...props} value={value} type={type ?? "text"} dir={direction}
            inputMode={question.type === "number" ? "decimal" : undefined}
            maxLength={["text", "phone"].includes(question.type ?? "text") ? 255 : undefined}
            onChange={( event ) => change(event.target.value)}
        />

    );

}
