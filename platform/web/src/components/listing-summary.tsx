import Divider from "@/elements/divider";
import Heading from "@/elements/heading";
import Link from "@/elements/link";
import Portrait from "@/elements/portrait";
import Score from "@/elements/score";
import Stack from "@/elements/stack";
import Surface from "@/elements/surface";
import Text from "@/elements/text";
import Icon, { isIconName } from "@/icons/icon";
import { initials } from "@/lib/std/text";

type Props = {
    title: string;
    capacity: readonly string[];
    score: { value: string; word: string; detail: string; label: string } | null;
    reviews: { href: string; label: string } | null;
    favourite: string | null;
    host: { name: string; title: string; image?: string | null; detail: string | null; verified: string | null } | null;
    highlights: readonly { key: string; icon: string; title: string; detail?: string | null }[];
};

export default function ListingSummary ({ title, capacity, score, reviews, favourite, host, highlights }: Props) {

    return (

        <Stack gap={6}>

            <Stack gap={1}>

                <Heading level={2} size="h2">{title}</Heading>

                {capacity.length ? <Text size="value" tone="muted">{capacity.join(" · ")}</Text> : null}

            </Stack>

            {score ? (

                <Surface padding={5} radius="lg">

                    <Stack direction="responsive" align="center" justify="between" gap={4}>

                        {favourite ? (

                            <Stack direction="row" align="center" gap={3}>

                                <Icon name="medal" size="xl" tone="accent" weight="fill" />

                                <Stack gap={0}>

                                    <Text size="value" weight="semibold">{favourite}</Text>

                                    <Text size="small" tone="muted">{score.detail}</Text>

                                </Stack>

                            </Stack>

                        ) : <Score {...score} size="medium" />}

                        <Stack direction="row" align="center" gap={4}>

                            {favourite ? <Score value={score.value} label={score.label} size="medium" /> : null}

                            {reviews ? <Link href={reviews.href} variant="inline">{reviews.label}</Link> : null}

                        </Stack>

                    </Stack>

                </Surface>

            ) : null}

            {host ? (

                <Stack direction="row" align="center" gap={4}>

                    <Portrait src={host.image} alt="" initials={initials(host.name)} size="medium" />

                    <Stack gap={0}>

                        <Text size="value" weight="semibold" dir="auto">{host.title}</Text>

                        {host.detail || host.verified ? (

                            <Text size="small" tone="muted">{[host.verified, host.detail].filter(Boolean).join(" · ")}</Text>

                        ) : null}

                    </Stack>

                </Stack>

            ) : null}

            {highlights.length ? (

                <>

                    <Divider />

                    <Stack as="ul" gap={5}>

                        {highlights.map(( item ) => (

                            <Stack as="li" key={item.key} direction="row" align="start" gap={4}>

                                <Icon name={isIconName(item.icon) ? item.icon : "check"} size="lg" />

                                <Stack gap={0}>

                                    <Text size="value" weight="semibold">{item.title}</Text>

                                    {item.detail ? <Text size="small" tone="muted">{item.detail}</Text> : null}

                                </Stack>

                            </Stack>

                        ))}

                    </Stack>

                    <Divider />

                </>

            ) : null}

        </Stack>

    );

}
