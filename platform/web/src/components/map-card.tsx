import Emblem from "@/elements/emblem";
import Heading from "@/elements/heading";
import Link from "@/elements/link";
import Stack from "@/elements/stack";
import Surface from "@/elements/surface";
import Text from "@/elements/text";
import Icon, { isIconName } from "@/icons/icon";

type Props = {
    title: string; place: string | null; kind: string | null; icon: string; coordinates: string | null; href: string | null; open: string;
};

export default function MapCard ({ title, place, kind, icon, coordinates, href, open }: Props) {

    return (

        <Surface padding={6} radius="lg">

            <Stack direction="responsive" align="center" justify="between" gap={5}>

                <Stack direction="row" align="center" gap={4}>

                    <Emblem size="large" shape="round" tone="teal">{isIconName(icon) ? <Icon name={icon} /> : null}</Emblem>

                    <Stack gap={1}>

                        <Heading level={2} size="title">{title}</Heading>

                        {place || kind ? <Text tone="muted">{[kind, place].filter(Boolean).join(", ")}</Text> : null}

                        {coordinates ? <Text size="label" tone="muted" numeric dir="ltr">{coordinates}</Text> : null}

                    </Stack>

                </Stack>

                {href ? (

                    <Link href={href} variant="outlined" shape="pill" target="_blank" rel="noopener noreferrer">

                        <Icon name="map" />{open}<Icon name="external" size="sm" />

                    </Link>

                ) : null}

            </Stack>

        </Surface>

    );

}
