import type { ReactNode } from "react";
import Badge from "@/elements/badge";
import Heading from "@/elements/heading";
import Link from "@/elements/link";
import Portrait from "@/elements/portrait";
import Stack from "@/elements/stack";
import Surface from "@/elements/surface";
import Text from "@/elements/text";
import Icon from "@/icons/icon";
import { initials } from "@/lib/std/text";

type Props = {
    contact?: ReactNode;
    name: string;
    title: string;
    image?: string | null;
    detail: string | null;
    verified: string | null;
    href?: string | null;
    profile?: string;
    facts?: readonly string[];
};

export default function HostCard ({ contact, name, title, image, detail, verified, href, profile, facts = [] }: Props) {

    return (

        <Surface padding={6} radius="lg">

            <Stack direction="responsive" align="center" justify="between" gap={5}>

                <Stack direction="row" align="center" gap={4}>

                    <Portrait src={image} alt={name} initials={initials(name)} size="large" />

                    <Stack gap={1}>

                        <Heading level={2} size="title">{title}</Heading>

                        {detail ? <Text size="small" tone="muted">{detail}</Text> : null}

                        <Stack direction="row" align="center" gap={2} wrap>

                            {verified ? <Badge tone="teal"><Icon name="seal" weight="fill" />{verified}</Badge> : null}

                            {facts.map(( fact ) => <Badge key={fact} look="flat">{fact}</Badge>)}

                        </Stack>

                    </Stack>

                </Stack>

                <Stack direction="row" gap={2} wrap>

                    {contact}

                    {href && profile ? <Link href={href} variant="outlined" size="medium">{profile}</Link> : null}

                </Stack>

            </Stack>

        </Surface>

    );

}
