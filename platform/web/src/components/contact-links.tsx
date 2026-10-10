import Link from "@/elements/link";
import Stack from "@/elements/stack";
import Text from "@/elements/text";
import Icon, { isIconName } from "@/icons/icon";

type Props = {
    items: readonly { href: string; label: string; display: string; icon: string }[];
};

export default function ContactLinks ({ items }: Props) {

    if ( !items.length ) return null;

    return (

        <Stack direction="row" gap={2} wrap>

            {items.map(( item ) => (

                <Link key={item.href} href={item.href} aria-label={item.label} variant="outlined" size="small">

                    {isIconName(item.icon) ? <Icon name={item.icon} /> : null}

                    <Text as="span" size="small" tone="inherit" weight="medium" dir="ltr">{item.display}</Text>

                </Link>

            ))}

        </Stack>

    );

}
