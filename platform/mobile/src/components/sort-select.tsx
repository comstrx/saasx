import Field from "@/elements/field";
import Select, { type Choice } from "@/elements/select";

type Props = { label: string; value: string; choices: readonly Choice[]; onChange: ( value: string ) => void };

export default function SortSelect ({ label, value, choices, onChange }: Props) {

    return (

        <Field label={label}>

            <Select name="sort" value={value} choices={choices} onChange={onChange} />

        </Field>

    );

}
