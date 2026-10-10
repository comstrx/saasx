import Grid from "@/elements/grid";
import Stack from "@/elements/stack";
import Surface from "@/elements/surface";
import Text from "@/elements/text";
import Icon, { type IconName } from "@/icons/icon";
import Section from "./section";

type Item = { key: string; term: string; detail: string };
type Props = { id?: string; title: string; items: readonly Item[]; mark?: IconName; tone?: "success" | "accent" | "muted" };

export default function ChecklistPanel ({ id, title, items, mark = "check-circle", tone = "success" }: Props) {

    if ( !items.length ) return null;

    const color = tone === "muted" ? "muted" : tone === "accent" ? "accent" : "success";

    return (

        <Section id={id} title={title}>

            <Surface padding={6} radius="xl">

                <Grid columns={2} mobileColumns={1} gap={5} label={title}>

                    {items.map(( item ) => (

                        <Stack as="li" key={item.key} direction="row" align="start" gap={3}>

                            <Icon name={mark} size="lg" weight="fill" tone={color} />

                            <Stack gap={0}>

                                <Text size="value" weight="semibold" dir="auto">{item.term}</Text>

                                {item.detail ? <Text size="small" tone="muted" dir="auto" wrap="pretty">{item.detail}</Text> : null}

                            </Stack>

                        </Stack>

                    ))}

                </Grid>

            </Surface>

        </Section>

    );

}
