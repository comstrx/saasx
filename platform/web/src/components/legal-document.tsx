import Faceted from "@/elements/faceted";
import Heading from "@/elements/heading";
import Link from "@/elements/link";
import Stack from "@/elements/stack";
import Surface from "@/elements/surface";
import Text from "@/elements/text";
import Icon from "@/icons/icon";

type Clause = { key: string; number: string; title: string; body: string };
type Props = { clauses: readonly Clause[]; updated: string | null; labels: { index: string } };

export default function LegalDocument ({ clauses, updated, labels }: Props) {

    return (

        <Faceted
            label={labels.index}
            side={(

                <Surface padding={5} radius="lg">

                    <Stack gap={3}>

                        <Heading level={2} size="label" tone="muted">{labels.index}</Heading>

                        <Stack as="ol" gap={1}>

                            {clauses.map(( clause ) => (

                                <Stack as="li" key={clause.key} direction="row">

                                    <Link href={`#${clause.key}`} variant="tile">

                                        <Text as="span" size="label" tone="muted" numeric>{clause.number}</Text>

                                        <Text as="span" size="small" weight="medium" dir="auto">{clause.title}</Text>

                                    </Link>

                                </Stack>

                            ))}

                        </Stack>

                    </Stack>

                </Surface>

            )}
        >

            <Surface padding={10} radius="xl">

                <Stack gap={8}>

                    {updated ? (

                        <Stack direction="row" align="center" gap={2}>

                            <Icon name="calendar-check" size="sm" tone="accent" />

                            <Text as="span" size="small" tone="muted">{updated}</Text>

                        </Stack>

                    ) : null}

                    <Stack as="ol" gap={8}>

                        {clauses.map(( clause ) => (

                            <Stack as="li" key={clause.key} id={clause.key} direction="row" align="start" gap={4}>

                                <Text as="span" size="title" weight="bold" tone="accent" numeric>{clause.number}</Text>

                                <Stack gap={2} grow>

                                    <Heading level={2} size="h3" dir="auto">{clause.title}</Heading>

                                    <Text tone="muted" wrap="pretty" dir="auto" measure="readable">{clause.body}</Text>

                                </Stack>

                            </Stack>

                        ))}

                    </Stack>

                </Stack>

            </Surface>

        </Faceted>

    );

}
