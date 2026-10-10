import Art from "@/elements/art";
import Badge from "@/elements/badge";
import Chip from "@/elements/chip";
import Divider from "@/elements/divider";
import Facts from "@/elements/facts";
import Heading from "@/elements/heading";
import Stack from "@/elements/stack";
import Surface from "@/elements/surface";
import Text from "@/elements/text";
import Icon from "@/icons/icon";

type Props = {
    art: string; points: string;
    level: {
        name: string; description: string | null;
        perks: readonly { key: string; label: string; value: string }[]; benefits: readonly { key: string; label: string }[];
    } | null;
    next: { name: string; conditions: readonly { key: string; label: string }[] } | null;
    ladder: readonly { key: string; name: string; reached: boolean; current: boolean }[];
    labels: { yourLevel: string; points: string; perks: string; next: string; nextBody: string; ladder: string; current: string };
    onLevel?: ( key: string ) => void;
};

export default function LoyaltyCard ({ art, points, level, next, ladder, labels, onLevel }: Props) {

    return (

        <Surface padding={8} radius="hero" elevation="medium">

            <Stack gap={6}>

                <Stack direction="wide" align="center" justify="between" gap={6}>

                    <Stack direction="row" align="center" gap={5}>

                        <Art src={art} size="medium" glow />

                        <Stack gap={1}>

                            <Text size="small" tone="muted">{labels.yourLevel}</Text>

                            <Heading level={2} size="h2">{level?.name ?? "—"}</Heading>

                            {level?.description ? <Text size="small" tone="muted" clamp={2}>{level.description}</Text> : null}

                        </Stack>

                    </Stack>

                    <Stack gap={1} align="end">

                        <Text size="small" tone="muted">{labels.points}</Text>

                        <Stack direction="row" align="center" gap={2}>

                            <Icon name="medal" tone="accent" />

                            <Text size="title" weight="bold" numeric>{points}</Text>

                        </Stack>

                    </Stack>

                </Stack>

                {ladder.length ? (

                    <Stack gap={2}>

                        <Text size="label" tone="muted">{labels.ladder}</Text>

                        <Stack direction="row" gap={2} wrap>

                            {ladder.map(( step ) => onLevel ? (

                                <Chip key={step.key} pressed={step.current} onClick={() => onLevel(step.key)}>

                                    {step.reached ? <Icon name="check" size="sm" /> : null}

                                    {step.name}

                                </Chip>

                            ) : (

                                <Badge key={step.key} tone={step.current ? "teal" : "neutral"} look={step.current ? "ceramic" : "flat"}>

                                    {step.reached ? <Icon name="check" size="sm" /> : null}

                                    {step.name}

                                </Badge>

                            ))}

                        </Stack>

                    </Stack>

                ) : null}

                {level?.perks.length || level?.benefits.length ? <Divider /> : null}

                {level?.perks.length || level?.benefits.length ? (

                    <Stack gap={3}>

                        <Heading level={3} size="label">{labels.perks}</Heading>

                        <Facts
                            columns={3} raised
                            items={[
                                ...level.perks.map(( perk ) => ({
                                    key: perk.key, term: perk.label, detail: perk.value || undefined, icon: <Icon name="gift" />,
                                })),
                                ...level.benefits.map(( benefit ) => ({
                                    key: benefit.key, term: benefit.label, icon: <Icon name="check-circle" />,
                                })),
                            ]}
                        />

                    </Stack>

                ) : null}

                {next ? (

                    <Surface tone="track" elevation="none" padding={5} radius="md">

                        <Stack gap={2}>

                            <Text weight="semibold">{labels.next}</Text>

                            {next.conditions.length ? next.conditions.map(( condition ) => (

                                <Stack key={condition.key} direction="row" align="center" gap={2}>

                                    <Icon name="arrow-end" size="sm" tone="accent" />

                                    <Text size="small" tone="muted">{condition.label}</Text>

                                </Stack>

                            )) : <Text size="small" tone="muted">{labels.nextBody}</Text>}

                        </Stack>

                    </Surface>

                ) : null}

            </Stack>

        </Surface>

    );

}
