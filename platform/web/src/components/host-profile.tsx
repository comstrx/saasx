import Badge from "@/elements/badge";
import Divider from "@/elements/divider";
import Facts from "@/elements/facts";
import Heading from "@/elements/heading";
import Portrait from "@/elements/portrait";
import Stack from "@/elements/stack";
import Surface from "@/elements/surface";
import Text from "@/elements/text";
import Icon, { isIconName } from "@/icons/icon";

type Props = {
    name: string; initials: string; image: string | null; verified: string | null; city: string | null; since: string | null;
    stats: readonly { key: string; value: string; label: string }[];
    facts: readonly { key: string; term: string; detail: string; icon: string }[];
};

export default function HostProfile ({ name, initials, image, verified, city, since, stats, facts }: Props) {

    return (

        <Surface padding={8} radius="hero" elevation="medium">

            <Stack gap={6}>

                <Stack direction="wide" gap={8} align="center" justify="between">

                    <Stack direction="row" gap={5} align="center">

                        <Portrait src={image} alt={name} initials={initials} size="xlarge" />

                        <Stack gap={2}>

                            {verified ? (

                                <Stack direction="row"><Badge tone="teal"><Icon name="seal" weight="fill" />{verified}</Badge></Stack>

                            ) : null}

                            <Heading level={1} size="h1">{name}</Heading>

                            {city || since ? (

                                <Stack direction="row" gap={4} wrap>

                                    {city ? <Text tone="muted">{city}</Text> : null}

                                    {since ? <Text tone="muted">{since}</Text> : null}

                                </Stack>

                            ) : null}

                        </Stack>

                    </Stack>

                    <Stack direction="row" gap={6} wrap>

                        {stats.map(( stat, index ) => (

                            <Stack key={stat.key} direction="row" gap={6} align="center">

                                {index ? <Divider direction="vertical" /> : null}

                                <Stack gap={0}>

                                    <Text size="title" weight="bold" numeric>{stat.value}</Text>

                                    <Text size="small" tone="muted">{stat.label}</Text>

                                </Stack>

                            </Stack>

                        ))}

                    </Stack>

                </Stack>

                {facts.length ? <Divider /> : null}

                {facts.length ? (

                    <Facts
                        columns={3}
                        raised
                        items={facts.map(( fact ) => ({
                            key: fact.key, term: fact.term, detail: fact.detail,
                            icon: isIconName(fact.icon) ? <Icon name={fact.icon} /> : undefined,
                        }))}
                    />

                ) : null}

            </Stack>

        </Surface>

    );

}
