type Props = { text: string; tone?: "default" | "muted" | "danger" | "success" | undefined; size?: "sm" | "md" | "lg" | undefined };

export default function Text ({ text, tone = "default", size = "md" }: Props) {

    return <p className="text" data-tone={tone} data-size={size}>{text}</p>;

}
