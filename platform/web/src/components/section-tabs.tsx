import Link from "@/elements/link";
import Stack from "@/elements/stack";
import Text from "@/elements/text";
import Icon, { isIconName } from "@/icons/icon";
import ScrollRow from "./scroll-row";

type Props = {
    label: string;
    items: readonly { key: string; label: string; icon: string | null; count: string; href: string; current: boolean }[];
};

export default function SectionTabs ({ label, items }: Props) {

    return (

        <ScrollRow label={label} gap={1}>

            {items.map(( item ) => (

                <Stack as="li" key={item.key} direction="row">

                    <Link href={item.href} variant="nav" active={item.current} scroll={false}>

                        {isIconName(item.icon) ? (

                            <Icon name={item.icon} weight={item.current ? "fill" : "regular"} tone={item.current ? "primary" : "inherit"} />

                        ) : null}

                        {item.label}

                        <Text as="span" size="label" tone="muted" numeric>{item.count}</Text>

                    </Link>

                </Stack>

            ))}

        </ScrollRow>

    );

}
