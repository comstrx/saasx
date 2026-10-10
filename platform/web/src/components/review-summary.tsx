import Divider from "@/elements/divider";
import Heading from "@/elements/heading";
import Progress from "@/elements/progress";
import Score from "@/elements/score";
import Stack from "@/elements/stack";
import Stars from "@/elements/stars";
import Surface from "@/elements/surface";
import Text from "@/elements/text";
import Icon from "@/icons/icon";

type Props = {
    title: string;
    score: { value: string; word: string; detail: string; label: string } | null;
    rating: number;
    stars: string;
    bars: readonly { key: string; label: string; count: string; share: number; name: string }[];
    note: string;
    empty: string;
};

export default function ReviewSummary ({ title, score, rating, stars, bars, note, empty }: Props) {

    return (

        <Surface padding={6} radius="xl">

            <Stack gap={5}>

                <Heading level={3} size="title">{title}</Heading>

                {score ? (

                    <Stack gap={3}>

                        <Score {...score} size="large" />

                        <Stars value={rating} label={stars} size="large" />

                    </Stack>

                ) : <Text size="small" tone="muted">{empty}</Text>}

                {bars.length ? (

                    <Stack as="ul" gap={2}>

                        {bars.map(( bar ) => (

                            <Stack as="li" key={bar.key} direction="row" align="center" gap={3}>

                                <Stack direction="row" align="center" gap={1} fixed>

                                    <Text as="span" size="label" weight="semibold" numeric>{bar.label}</Text>

                                    <Icon name="star" size="xs" weight="fill" />

                                </Stack>

                                <Stack grow><Progress value={bar.share} label={bar.name} /></Stack>

                                <Text as="span" size="label" tone="muted" numeric>{bar.count}</Text>

                            </Stack>

                        ))}

                    </Stack>

                ) : null}

                <Divider />

                <Stack direction="row" align="start" gap={2}>

                    <Icon name="seal" size="md" tone="success" weight="fill" />

                    <Text size="label" tone="muted">{note}</Text>

                </Stack>

            </Stack>

        </Surface>

    );

}
