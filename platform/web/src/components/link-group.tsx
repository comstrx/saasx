import Grid from "@/elements/grid";
import Heading from "@/elements/heading";
import Link from "@/elements/link";
import Stack from "@/elements/stack";
import Icon, { isIconName } from "@/icons/icon";

type Props = {
    title: string;
    wide?: boolean;
    links: readonly { href: string; label: string; icon?: string | null; external?: boolean }[];
};

export default function LinkGroup ({ title, wide = false, links }: Props) {

    const items = links.map(( link ) => (

        <Stack as="li" key={link.href}>

            <Link href={link.href} variant="quiet" target={link.external ? "_blank" : undefined}>

                {isIconName(link.icon) ? <Icon name={link.icon} size="sm" /> : null}

                {link.label}

            </Link>

        </Stack>

    ));

    return (

        <Stack gap={4}>

            <Heading level={3} size="label">{title}</Heading>

            {wide ? <Grid columns={2} mobileColumns={2} gap={3}>{items}</Grid> : <Stack as="ul" gap={3}>{items}</Stack>}

        </Stack>

    );

}
