import Grid from "@/elements/grid";
import Heading from "@/elements/heading";
import Stack from "@/elements/stack";
import Text from "@/elements/text";
import Icon, { isIconName } from "@/icons/icon";
import Section from "./section";

type Column = { key: string; title: string; icon: string; items: readonly string[] };
type Props = { id?: string; title: string; columns: readonly Column[] };

export default function ThingsToKnow ({ id, title, columns }: Props) {

    const filled = columns.filter(( column ) => column.items.length);

    if ( !filled.length ) return null;

    return (

        <Section id={id} title={title}>

            <Grid as="div" columns={3} mobileColumns={1} gap={8}>

                {filled.map(( column ) => (

                    <Stack key={column.key} gap={4}>

                        <Stack direction="row" align="center" gap={2}>

                            {isIconName(column.icon) ? <Icon name={column.icon} size="md" /> : null}

                            <Heading level={3} size="title">{column.title}</Heading>

                        </Stack>

                        <Stack as="ul" gap={3}>

                            {column.items.map(( item ) => (

                                <Stack as="li" key={item}>

                                    <Text size="value" tone="muted" dir="auto" wrap="pretty">{item}</Text>

                                </Stack>

                            ))}

                        </Stack>

                    </Stack>

                ))}

            </Grid>

        </Section>

    );

}
