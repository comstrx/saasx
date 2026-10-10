import Pebble from "@/elements/pebble";
import Stack from "@/elements/stack";
import Icon, { isIconName } from "@/icons/icon";

type Props = { items: readonly { href: string; label: string; icon: string }[] };

export default function SocialLinks ({ items }: Props) {

    if ( !items.length ) return null;

    return (

        <Stack direction="row" gap={2} wrap>

            {items.map(( item ) => (

                <Pebble key={item.href} href={item.href} label={item.label} size="small" shape="round">

                    {isIconName(item.icon) ? <Icon name={item.icon} /> : null}

                </Pebble>

            ))}

        </Stack>

    );

}
