import Link from "@/elements/link";
import Icon, { isIconName } from "@/icons/icon";

type Item = { href: string; label: string; icon?: string | null; current?: boolean };
type Props = { items: readonly Item[]; full?: boolean };

export default function NavigationLinks ({ items, full = false }: Props) {

    return items.map(( item ) => (

        <Link key={item.href} href={item.href} variant="nav" active={item.current} width={full ? "full" : "auto"}>

            {isIconName(item.icon) ? (

                <Icon name={item.icon} size="md" weight={item.current ? "fill" : "regular"} tone={item.current ? "primary" : "inherit"} />

            ) : null}

            {item.label}

        </Link>

    ));

}
