import Stack from "@/elements/stack";
import Text from "@/elements/text";
import Icon from "@/icons/icon";

type Props = { items: readonly string[] };

export default function TrustRow ({ items }: Props) {

    if ( !items.length ) return null;

    return (

        <Stack as="ul" direction="row" wrap gap={5} visibility="tablet">

            {items.map(( item ) => (

                <Stack as="li" key={item} direction="row" align="center" gap={2}>

                    <Icon name="check-circle" weight="fill" tone="success" size="md" />

                    <Text as="span" size="small" tone="muted">{item}</Text>

                </Stack>

            ))}

        </Stack>

    );

}
