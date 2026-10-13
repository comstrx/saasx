import { useId } from "react";
import Field from "@/elements/field";
import Select, { type Choice } from "@/elements/select";

type Props = { label: string; value: string; choices: readonly Choice[]; onChange: ( value: string ) => void };

export default function SortSelect ({ label, value, choices, onChange }: Props) {
    const id = useId();

    return (

        <Field id={id} label={label}>

            <Select id={id} name="sort" value={value} choices={choices} onChange={onChange} />

        </Field>

    );
}
