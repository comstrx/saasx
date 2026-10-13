import Field from "@/elements/field";
import Select, { type Choice } from "@/elements/select";
import Stack from "@/elements/stack";
import Text from "@/elements/text";

export type PreferenceName = "language" | "currency" | "theme";
export type PreferenceField = { name: PreferenceName; label: string; value: string; choices: readonly Choice[] };
type Props = { fields: readonly PreferenceField[]; note?: { text: string; tone: "muted" | "success" | "danger" } | undefined; onChange: ( name: PreferenceName, value: string ) => void };

export default function PreferenceForm ({ fields, note, onChange }: Props) {
    return (

        <Stack gap={4}>

            {fields.map(( field ) => (

                <Field key={field.name} label={field.label}>

                    <Select name={field.name} value={field.value} choices={field.choices} onChange={( value ) => onChange(field.name, value)} />

                </Field>

            ))}

            {note ? <Text text={note.text} tone={note.tone} size="sm" /> : null}

        </Stack>

    );
}
