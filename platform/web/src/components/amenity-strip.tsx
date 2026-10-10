import Heading from "@/elements/heading";
import Stack from "@/elements/stack";
import Text from "@/elements/text";
import Icon, { isIconName } from "@/icons/icon";

type Props = { title: string; items: readonly { key: string; term: string; icon?: string }[]; limit?: number };

export default function AmenityStrip ({ title, items, limit = 8 }: Props) {

    const shown = items.filter(( item ) => item.icon !== "ban").slice(0, limit);

    if ( !shown.length ) return null;

    return (

        <Stack gap={3}>

            <Heading level={3} size="title">{title}</Heading>

            <Stack as="ul" direction="row" gap={5} wrap aria-label={title}>

                {shown.map(( item ) => (

                    <Stack as="li" key={item.key} direction="row" align="center" gap={2}>

                        <Icon name={isIconName(item.icon) ? item.icon : "check"} size="md" tone="success" />

                        <Text as="span" size="value" dir="auto">{item.term}</Text>

                    </Stack>

                ))}

            </Stack>

        </Stack>

    );

}
