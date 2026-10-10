import Link from "@/elements/link";
import Stack from "@/elements/stack";
import Icon, { isIconName } from "@/icons/icon";

type Props = { items: readonly { href: string; label: string; icon?: string | null }[]; label: string };

export default function LinkCollection ({ items, label }: Props) {

    return (

        <Stack direction="row" gap={2} wrap role="group" aria-label={label}>

            {items.map(( item ) => (

                <Link key={item.href} href={item.href} variant="outlined">

                    {isIconName(item.icon) ? <Icon name={item.icon} size="md" tone="accent" /> : null}

                    {item.label}

                </Link>

            ))}

        </Stack>

    );

}
