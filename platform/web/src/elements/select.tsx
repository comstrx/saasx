export type Choice = { value: string; label: string };
type Props = { id: string; name: string; value: string; choices: readonly Choice[]; disabled?: boolean | undefined; onChange: ( value: string ) => void };

export default function Select ({ id, name, value, choices, disabled = false, onChange }: Props) {
    return (

        <select id={id} name={name} className="select" value={value} disabled={disabled} onChange={( event ) => onChange(event.target.value)}>

            {choices.map(( choice ) => <option key={choice.value} value={choice.value}>{choice.label}</option>)}

        </select>

    );
}
