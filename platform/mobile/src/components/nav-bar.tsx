import Bar from "@/elements/bar";
import Link from "@/elements/link";
import Text from "@/elements/text";

type Props = { brand: string; action: { href: string; label: string } };

export default function NavBar ({ brand, action }: Props) {

    return <Bar brand={<Text text={brand} size="lg" />} actions={<Link href={action.href} label={action.label} tone="primary" />} />;

}
