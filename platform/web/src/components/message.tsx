import Text from "@/elements/text";

type Props = { children: string; alert?: boolean };

export default function Message ({ children, alert }: Props) {

    return <Text size="small" tone={alert ? "danger" : "muted"} role={alert ? "alert" : undefined}>{children}</Text>;

}
