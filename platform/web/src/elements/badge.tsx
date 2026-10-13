type Props = { label: string; tone?: "default" | "primary" | "success" | undefined };

export default function Badge ({ label, tone = "default" }: Props) {

    return <span className="badge" data-tone={tone}>{label}</span>;

}
