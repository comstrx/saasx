import Emblem from "@/elements/emblem";
import Heading from "@/elements/heading";
import Link from "@/elements/link";
import Stack from "@/elements/stack";
import Surface from "@/elements/surface";
import Text from "@/elements/text";
import Icon, { isIconName } from "@/icons/icon";

type Item = { key: string; icon: string; title: string; detail?: string | null };
type Props = { title: string; items: readonly Item[]; action?: { href: string; label: string } | null };

export default function HighlightsPanel ({ title, items, action }: Props) {

    if ( !items.length ) return null;

    return (

        <Surface padding={6} radius="lg" tone="track" elevation="none">

            <Stack gap={5}>

                <Heading level={2} size="title">{title}</Heading>

                <Stack as="ul" gap={4}>

                    {items.map(( item ) => (

                        <Stack as="li" key={item.key} direction="row" align="start" gap={3}>

                            <Emblem size="small">{isIconName(item.icon) ? <Icon name={item.icon} /> : null}</Emblem>

                            <Stack gap={0}>

                                <Text size="small" weight="semibold">{item.title}</Text>

                                {item.detail ? <Text size="small" tone="muted">{item.detail}</Text> : null}

                            </Stack>

                        </Stack>

                    ))}

                </Stack>

                {action ? <Link href={action.href} variant="filled" size="large" width="full">{action.label}</Link> : null}

            </Stack>

        </Surface>

    );

}
