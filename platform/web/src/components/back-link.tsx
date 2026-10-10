import Link from "@/elements/link";
import Stack from "@/elements/stack";
import Icon from "@/icons/icon";

type Props = { href: string; label: string };

export default function BackLink ({ href, label }: Props) {

    return <Stack direction="row"><Link href={href} variant="quiet"><Icon name="arrow-start" size="sm" />{label}</Link></Stack>;

}
