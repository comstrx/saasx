import Bar from "@/elements/bar";
import Link from "@/elements/link";
import Text from "@/elements/text";

export type NavItem = { href: string; label: string; current?: boolean | undefined };

type Props = { brand: string; items: readonly NavItem[]; action: NavItem };

export default function NavBar ({ brand, items, action }: Props) {

    return (

        <Bar
            brand={<Text text={brand} size="lg" />}
            links={items.map(( item ) => <Link key={item.href} href={item.href} label={item.label} current={item.current} />)}
            actions={<Link href={action.href} label={action.label} tone="primary" />}
        />

    );

}
