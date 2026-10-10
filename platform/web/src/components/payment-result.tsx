import Link from "@/elements/link";
import Stack from "@/elements/stack";
import Text from "@/elements/text";

type Props = { text: string; href?: string; label: string };

export default function PaymentResult ({ text, href, label }: Props) {

    return (

        <Stack gap={4} role="status">

            <Text size="small" tone="muted">{text}</Text>
            {href ? <Link href={href} variant="filled" width="full">{label}</Link> : null}

        </Stack>

    );

}
