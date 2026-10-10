import Emblem from "@/elements/emblem";
import Grid from "@/elements/grid";
import Stack from "@/elements/stack";
import Surface from "@/elements/surface";
import Text from "@/elements/text";
import Icon, { isIconName } from "@/icons/icon";

type Item = { key: string; icon: string; title: string; detail?: string | null };
type Props = { label: string; items: readonly Item[] };

export default function FactStrip ({ label, items }: Props) {

    if ( !items.length ) return null;

    return (

        <Surface padding={5} radius="lg">

            <Grid columns={4} mobileColumns={2} gap={4} label={label}>

                {items.slice(0, 4).map(( item ) => (

                    <Stack as="li" key={item.key} direction="row" align="start" gap={3}>

                        <Emblem size="small" look="flat">{isIconName(item.icon) ? <Icon name={item.icon} /> : null}</Emblem>

                        <Stack gap={0}>

                            <Text as="span" size="label" tone="muted">{item.title}</Text>

                            {item.detail ? <Text as="span" size="small" weight="semibold" clamp={2}>{item.detail}</Text> : null}

                        </Stack>

                    </Stack>

                ))}

            </Grid>

        </Surface>

    );

}
