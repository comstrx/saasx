type Props = { label: string };

export default function Loading ({ label }: Props) {

    return (

        <div className="loading" role="status" aria-live="polite">

            <span className="loading-mark" aria-hidden />

            <span className="loading-label">{label}</span>

        </div>

    );

}
