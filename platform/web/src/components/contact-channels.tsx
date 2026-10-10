import Emblem from "@/elements/emblem";
import Grid from "@/elements/grid";
import Heading from "@/elements/heading";
import Link from "@/elements/link";
import Stack from "@/elements/stack";
import Surface from "@/elements/surface";
import Text from "@/elements/text";
import Icon, { isIconName } from "@/icons/icon";

type Channel = { key: string; icon: string; title: string; detail: string; href: string };
type Props = { channels: readonly Channel[]; support: { href: string; label: string } | null; hours: string; promise: string };

export default function ContactChannels ({ channels, support, hours, promise }: Props) {

    return (

        <Stack gap={6}>

            <Grid columns={3} gap={4} label={promise}>

                {channels.map(( channel ) => (

                    <Surface key={channel.key} as="li" padding={6} radius="lg" interactive>

                        <Stack gap={4}>

                            <Emblem tone="accent" size="large">{isIconName(channel.icon) ? <Icon name={channel.icon} /> : null}</Emblem>

                            <Stack gap={1}>

                                <Heading level={2} size="title">

                                    <Link href={channel.href} variant="card">{channel.title}</Link>

                                </Heading>

                                <Text size="small" tone="muted" dir="ltr" align="start">{channel.detail}</Text>

                            </Stack>

                        </Stack>

                    </Surface>

                ))}

            </Grid>

            <Surface padding={6} radius="lg" tone="track" elevation="none">

                <Stack direction="responsive" align="center" justify="between" gap={4}>

                    <Stack direction="row" align="center" gap={4}>

                        <Emblem tone="teal" size="large"><Icon name="clock" /></Emblem>

                        <Stack gap={1}>

                            <Text weight="semibold">{promise}</Text>

                            <Text size="small" tone="muted">{hours}</Text>

                        </Stack>

                    </Stack>

                    {support ? <Link href={support.href} variant="filled" size="large">{support.label}</Link> : null}

                </Stack>

            </Surface>

        </Stack>

    );

}
