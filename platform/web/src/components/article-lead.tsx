import Heading from "@/elements/heading";
import Link from "@/elements/link";
import Media from "@/elements/media";
import Stack from "@/elements/stack";
import Surface from "@/elements/surface";
import Text from "@/elements/text";
import Icon from "@/icons/icon";

type Props = { title: string; description: string | null; image: string | null; date: string | null; reading: string; href: string | null };

export default function ArticleLead ({ title, description, image, date, reading, href }: Props) {

    return (

        <Surface as="article" padding={3} radius="hero" interactive={Boolean(href)}>

            <Stack direction="wide" gap={6} align="center">

                <Stack width="full">

                    <Media src={image} alt="" ratio="wide" radius="large" zoom />

                </Stack>

                <Stack width="full">

                    <Surface tone="clear" border={false} elevation="none" padding={6} radius="none">

                        <Stack gap={4}>

                            <Stack direction="row" align="center" gap={4} wrap>

                                {date ? <Text as="span" size="small" tone="muted">{date}</Text> : null}

                                <Stack direction="row" align="center" gap={1}>

                                    <Icon name="clock" size="sm" tone="muted" />

                                    <Text as="span" size="small" tone="muted">{reading}</Text>

                                </Stack>

                            </Stack>

                            <Heading level={2} size="h2" clamp={3}>

                                {href ? <Link href={href} variant="card" dir="auto">{title}</Link> : title}

                            </Heading>

                            {description ? <Text tone="muted" clamp={3} wrap="pretty">{description}</Text> : null}

                        </Stack>

                    </Surface>

                </Stack>

            </Stack>

        </Surface>

    );

}
