type Props = { id: string; name: string; label: string; checked: boolean; disabled?: boolean | undefined; onChange: ( value: boolean ) => void };

export default function Checkbox ({ id, name, label, checked, disabled = false, onChange }: Props) {

    return (

        <label className="checkbox" htmlFor={id}>

            <input id={id} name={name} type="checkbox" className="checkbox-input" checked={checked} disabled={disabled} onChange={( event ) => onChange(event.target.checked)} />

            <span className="checkbox-label">{label}</span>

        </label>

    );

}
