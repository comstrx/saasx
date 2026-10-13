type Props = { id: string; name: string; accept?: string | undefined; capture?: "environment" | "user" | undefined; disabled?: boolean | undefined; invalid?: boolean | undefined; onChange: ( file: File | null ) => void };

export default function FileInput ({ id, name, accept, capture, disabled = false, invalid = false, onChange }: Props) {
    return (

        <input id={id} name={name} type="file" className="file" accept={accept} capture={capture} disabled={disabled} aria-invalid={invalid || undefined} onChange={( event ) => onChange(event.target.files?.[0] ?? null)} />

    );
}
