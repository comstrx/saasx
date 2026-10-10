import Link from "@/elements/link";
import Stack from "@/elements/stack";
import Text from "@/elements/text";

type Props = { prompt?: string; links: readonly { label: string; href: string }[] };

export default function FormLinks ({ prompt, links }: Props) {

    return (

        <Stack direction="row" gap={2} align="center" justify="center" wrap>

            {prompt ? <Text as="span" size="small" tone="muted">{prompt}</Text> : null}

            {links.map(( link ) => <Link key={link.href} href={link.href} variant="nav">{link.label}</Link>)}

        </Stack>

    );

}
