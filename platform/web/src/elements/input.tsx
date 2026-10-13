type Props = { id: string; name: string; kind?: "text" | "email" | "password" | "search" | "tel" | "number" | "date" | "datetime-local" | undefined; value: string; placeholder?: string | undefined; autoComplete?: string | undefined; invalid?: boolean | undefined; disabled?: boolean | undefined; min?: number | undefined; max?: number | undefined; onChange: ( value: string ) => void };

export default function Input ({ id, name, kind = "text", value, placeholder, autoComplete, invalid = false, disabled = false, min, max, onChange }: Props) {
    return (

        <input id={id} name={name} type={kind} className="input" value={value} placeholder={placeholder} autoComplete={autoComplete} aria-invalid={invalid || undefined} disabled={disabled} min={min} max={max} onChange={( event ) => onChange(event.target.value)} />

    );
}
