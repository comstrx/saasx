"use client";

import { useId } from "react";
import Field from "@/elements/field";
import Select, { type Choice } from "@/elements/select";
import Stack from "@/elements/stack";
import Text from "@/elements/text";

export type PreferenceName = "language" | "currency" | "theme";
export type PreferenceField = { name: PreferenceName; label: string; value: string; choices: readonly Choice[] };
type Props = {
    fields: readonly PreferenceField[];
    busy: boolean;
    note?: { text: string; tone: "muted" | "success" | "danger" } | undefined;
    onChange: ( name: PreferenceName, value: string ) => void;
};

export default function PreferenceForm ({ fields, busy, note, onChange }: Props) {

    const id = useId();

    return (

        <Stack gap={4}>

            {fields.map(( field ) => (

                <Field key={field.name} id={`${id}-${field.name}`} label={field.label}>

                    <Select
                        id={`${id}-${field.name}`}
                        name={field.name}
                        value={field.value}
                        choices={field.choices}
                        disabled={busy}
                        onChange={( value ) => onChange(field.name, value)}
                    />

                </Field>

            ))}

            {note ? <Text text={note.text} tone={note.tone} size="sm" /> : null}

        </Stack>

    );

}
