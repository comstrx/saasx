import Link from "@/elements/link";
import Stack from "@/elements/stack";
import Icon, { isIconName } from "@/icons/icon";
import ScrollRow from "./scroll-row";

type Item = { href: string; label: string; icon: string | null; current: boolean };
type Props = { label: string; items: readonly Item[] };

export default function VerticalTabs ({ label, items }: Props) {

    if ( !items.length ) return null;

    return (

        <ScrollRow label={label} gap={1}>

            {items.map(( item ) => (

                <Stack as="li" key={item.href} direction="row">

                    <Link href={item.href} variant="nav" active={item.current}>

                        {isIconName(item.icon) ? (

                            <Icon name={item.icon} weight={item.current ? "fill" : "regular"} tone={item.current ? "primary" : "inherit"} />

                        ) : null}

                        {item.label}

                    </Link>

                </Stack>

            ))}

        </ScrollRow>

    );

}
