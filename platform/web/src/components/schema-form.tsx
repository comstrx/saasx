"use client";

import { type FormState, fieldLabel, formText, localizedTexts } from "engine/client";
import { languageName } from "engine/translate";
import type { FieldFact } from "engine/validate";
import { type ReactNode, useId } from "react";
import Button from "@/elements/button";
import Checkbox from "@/elements/checkbox";
import Field from "@/elements/field";
import FileInput from "@/elements/file-input";
import Form from "@/elements/form";
import Input from "@/elements/input";
import Select from "@/elements/select";
import Stack from "@/elements/stack";
import Text from "@/elements/text";

export type Labels = Record<string, string>;
export type Choices = Record<string, Record<string, string>>;
type Props = {
    name: string;
    form: FormState<unknown>;
    labels: Labels;
    choices: Choices;
    submit: string;
    note?: { text: string; tone: "muted" | "success" | "danger" } | undefined;
    actions?: ReactNode | undefined;
};

const kinds = {
    text: "text",
    email: "email",
    phone: "tel",
    password: "password",
    number: "number",
    integer: "number",
    date: "date",
    datetime: "datetime-local",
} as const;

export default function SchemaForm ({ name, form, labels, choices, submit, note, actions }: Props) {

    const id = useId();
    const busy = form.status === "pending";
    const label = ( field: FieldFact ): string => fieldLabel(labels, field.name);
    const control = ( field: FieldFact ): ReactNode => {

        const key = `${id}-${field.name}`;
        const value = form.values[field.name] ?? null;
        const error = form.errors[field.name];

        if ( field.kind === "boolean" ) {

            return (

                <Checkbox
                    key={field.name}
                    id={key}
                    name={field.name}
                    label={label(field)}
                    checked={value === true}
                    disabled={busy}
                    onChange={( next ) => form.set(field.name, next)}
                />

            );

        }

        if ( field.kind === "choice" ) {

            const options = (field.choices ?? []).map(( choice ) => ({ value: choice, label: choices[field.name]?.[choice] ?? choice }));

            return (

                <Field key={field.name} id={key} label={label(field)} error={error}>

                    <Select
                        id={key}
                        name={field.name}
                        value={formText(value)}
                        choices={field.required ? options : [{ value: "", label: "—" }, ...options]}
                        disabled={busy}
                        onChange={( next ) => form.set(field.name, next)}
                    />

                </Field>

            );

        }

        if ( field.kind === "localized" ) {

            const texts = localizedTexts(value);

            return Object.keys(texts).map(( locale ) => (

                <Field
                    key={`${field.name}-${locale}`}
                    id={`${key}-${locale}`}
                    label={`${label(field)} · ${languageName(locale, locale)}`}
                    error={error}
                >

                    <Input
                        id={`${key}-${locale}`}
                        name={`${field.name}[${locale}]`}
                        value={texts[locale] ?? ""}
                        invalid={Boolean(error)}
                        disabled={busy}
                        onChange={( next ) => form.set(field.name, { ...texts, [locale]: next })}
                    />

                </Field>

            ));

        }

        if ( field.kind === "file" ) {

            return (

                <Field key={field.name} id={key} label={label(field)} error={error}>

                    <FileInput
                        id={key}
                        name={field.name}
                        accept="image/*"
                        disabled={busy}
                        invalid={Boolean(error)}
                        onChange={( file ) => form.set(field.name, file)}
                    />

                </Field>

            );

        }

        if ( field.kind === "list" ) {

            const items = Array.isArray(value) ? value : [];

            return (

                <Field key={field.name} id={key} label={label(field)} error={error}>

                    <Input
                        id={key}
                        name={field.name}
                        value={items.join(", ")}
                        invalid={Boolean(error)}
                        disabled={busy}
                        onChange={( next ) => form.set(field.name, next.split(",").map(( item ) => item.trim()).filter(Boolean))}
                    />

                </Field>

            );

        }

        if ( !(field.kind in kinds) ) return null;

        return (

            <Field key={field.name} id={key} label={label(field)} error={error}>

                <Input
                    id={key}
                    name={field.name}
                    kind={kinds[field.kind as keyof typeof kinds]}
                    value={formText(value)}
                    invalid={Boolean(error)}
                    disabled={busy}
                    min={field.min}
                    max={field.max}
                    onChange={( next ) => form.set(field.name, next)}
                />

            </Field>

        );

    };

    return (

        <Form name={name} onSubmit={() => { void form.submit(); }}>

            <Stack gap={3}>

                {form.fields.map(control)}

                {form.errors._form ? <Text text={form.errors._form} tone="danger" size="sm" /> : null}

                {note ? <Text text={note.text} tone={note.tone} size="sm" /> : null}

                <Stack direction="row" gap={2} align="between">

                    <Button label={submit} type="submit" busy={busy} disabled={!form.dirty && form.status !== "idle"} />

                    {actions}

                </Stack>

            </Stack>

        </Form>

    );

}
