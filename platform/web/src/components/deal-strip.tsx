import Emblem from "@/elements/emblem";
import Link from "@/elements/link";
import Stack from "@/elements/stack";
import Surface from "@/elements/surface";
import Text from "@/elements/text";
import Icon from "@/icons/icon";

type Props = { title: string; body: string; until: string | null; href: string | null; action: string };

export default function DealStrip ({ title, body, until, href, action }: Props) {

    return (

        <Surface padding={4} radius="xl">

            <Stack direction="row" align="center" gap={4} wrap>

                <Emblem tone="ember" shape="round"><Icon name="gift" weight="fill" /></Emblem>

                <Stack gap={0} grow>

                    <Text weight="semibold" dir="auto">{title}</Text>

                    <Text size="small" tone="muted">{body}</Text>

                    {until ? <Text size="label" tone="offer" weight="semibold">{until}</Text> : null}

                </Stack>

                {href ? (

                    <Link href={href} variant="outlined" size="medium" shape="pill">

                        {action}<Icon name="caret-end" size="sm" />

                    </Link>

                ) : null}

            </Stack>

        </Surface>

    );

}
