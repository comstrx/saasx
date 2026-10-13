type Props = { label: string };

export default function Spinner ({ label }: Props) {
    return <span className="spinner" role="status" aria-live="polite" aria-label={label} />;
}
