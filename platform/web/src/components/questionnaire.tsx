"use client";

import Stack from "@/elements/stack";
import { useTranslations } from "@/lib/providers/intl";
import type { QuestionGroup } from "@/lib/std/intake";
import ErrorSummary from "./error-summary";
import FormSection from "./form-section";
import QuestionField from "./question-field";

type Props = {
    groups: readonly QuestionGroup[]; values: Readonly<Record<string, string>>; errors: Readonly<Record<string, string>>;
    id: ( key: string ) => string; onChange: ( value: Record<string, string> ) => void; disabled?: boolean;
};

export default function Questionnaire ({ groups, values, errors, id, onChange, disabled }: Props) {

    const t = useTranslations("intake");

    const labels = new Map(groups.flatMap(( { question, fields } ) => fields.map(( field ) => {

        const title = question.label || t("question");
        const scoped = ["applicant", "traveller", "guest"].includes(question.scope ?? "");
        const label = scoped ? t("personQuestion", { label: title, index: field.index + 1,
            person: t(question.scope === "guest" ? "guest" : question.scope === "applicant" ? "applicant" : "traveller"),
        }) : title;

        return [field.key, label] as const;

    })));
    const failures = [...labels].flatMap(( [key, label] ) => errors[key] ? [{ id: id(key), label, message: errors[key] }] : []);

    if ( !groups.length ) return null;

    return (

        <FormSection title={t("title")} description={t("description")}>

            <ErrorSummary title={t("checkAnswers")} items={failures} />

            {groups.map(( { question, fields } ) => (

                <Stack key={question.key} gap={5}>

                    {fields.map(( field ) => {

                        const label = labels.get(field.key) || t("question");

                        return (

                            <QuestionField
                                key={field.key} question={question} field={field.key} id={id(field.key)}
                                label={t(question.required ? "requiredLabel" : "optionalLabel", { label })}
                                values={values} error={errors[field.key] || errors[`answers.${question.key}`]}
                                onChange={onChange} disabled={disabled}
                            />

                        );

                    })}

                </Stack>

            ))}

        </FormSection>

    );

}
