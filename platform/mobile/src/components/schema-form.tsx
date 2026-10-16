import { type FormState, fieldLabel, formText, localizedTexts } from "engine/client";
import { languageName } from "engine/translate";
import type { FieldFact } from "engine/validate";
import type { ReactNode } from "react";
import Button from "@/elements/button";
import Checkbox from "@/elements/checkbox";
import Field from "@/elements/field";
import Input from "@/elements/input";
import Select from "@/elements/select";
import Stack from "@/elements/stack";
import Text from "@/elements/text";

export type Labels = Record<string, string>;
export type Choices = Record<string, Record<string, string>>;
type Props = {
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
    phone: "phone",
    password: "password",
    number: "number",
    integer: "number",
    date: "date",
    datetime: "date",
} as const;

export default function SchemaForm ({ form, labels, choices, submit, note, actions }: Props) {

    const busy = form.status === "pending";
    const label = ( field: FieldFact ): string => fieldLabel(labels, field.name);
    const control = ( field: FieldFact ): ReactNode => {

        const value = form.values[field.name] ?? null;
        const error = form.errors[field.name];

        if ( field.kind === "boolean" ) {

            return (

                <Checkbox
                    key={field.name}
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

                <Field key={field.name} label={label(field)} error={error}>

                    <Select
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

                <Field key={`${field.name}-${locale}`} label={`${label(field)} · ${languageName(locale, locale)}`} error={error}>

                    <Input
                        name={`${field.name}[${locale}]`}
                        value={texts[locale] ?? ""}
                        invalid={Boolean(error)}
                        disabled={busy}
                        onChange={( next ) => form.set(field.name, { ...texts, [locale]: next })}
                    />

                </Field>

            ));

        }

        if ( field.kind === "list" ) {

            const items = Array.isArray(value) ? value : [];

            return (

                <Field key={field.name} label={label(field)} error={error}>

                    <Input
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

            <Field key={field.name} label={label(field)} error={error}>

                <Input
                    name={field.name}
                    kind={kinds[field.kind as keyof typeof kinds]}
                    value={formText(value)}
                    invalid={Boolean(error)}
                    disabled={busy}
                    onChange={( next ) => form.set(field.name, next)}
                />

            </Field>

        );

    };

    return (

        <Stack gap={3}>

            {form.fields.map(control)}

            {form.errors._form ? <Text text={form.errors._form} tone="danger" size="sm" /> : null}

            {note ? <Text text={note.text} tone={note.tone} size="sm" /> : null}

            <Stack direction="row" gap={2} align="between">

                <Button
                    label={submit}
                    busy={busy}
                    disabled={!form.dirty && form.status !== "idle"}
                    onPress={() => { void form.submit(); }}
                />

                {actions}

            </Stack>

        </Stack>

    );

}
