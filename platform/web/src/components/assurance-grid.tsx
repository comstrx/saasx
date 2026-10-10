import Emblem from "@/elements/emblem";
import Grid from "@/elements/grid";
import Heading from "@/elements/heading";
import Stack from "@/elements/stack";
import Surface from "@/elements/surface";
import Text from "@/elements/text";
import Icon, { isIconName } from "@/icons/icon";
import Section from "./section";

type Item = { key: string; icon: string; title: string; body: string };
type Props = { title: string; description?: string; items: readonly Item[] };

export default function AssuranceGrid ({ title, description, items }: Props) {

    return (

        <Section title={title} description={description}>

            <Grid as="ul" columns={4} gap={4} label={title}>

                {items.map(( item ) => (

                    <Surface key={item.key} as="li" padding={6} radius="lg">

                        <Stack gap={4}>

                            <Emblem tone="accent" size="large">{isIconName(item.icon) ? <Icon name={item.icon} /> : null}</Emblem>

                            <Stack gap={1}>

                                <Heading level={3} size="title">{item.title}</Heading>

                                <Text size="small" tone="muted" wrap="pretty">{item.body}</Text>

                            </Stack>

                        </Stack>

                    </Surface>

                ))}

            </Grid>

        </Section>

    );

}
