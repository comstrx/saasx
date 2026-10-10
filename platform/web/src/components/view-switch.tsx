import Chip from "@/elements/chip";
import Stack from "@/elements/stack";
import Text from "@/elements/text";
import Icon, { isIconName } from "@/icons/icon";

type Props = { label: string; items: readonly { key: string; label: string; icon: string; href: string; current: boolean }[] };

export default function ViewSwitch ({ label, items }: Props) {

    return (

        <Stack direction="row" gap={1} role="group" aria-label={label}>

            {items.map(( item ) => (

                <Chip key={item.key} href={item.href} pressed={item.current} label={item.label} scroll={false}>

                    {isIconName(item.icon) ? <Icon name={item.icon} size="sm" weight={item.current ? "bold" : "regular"} /> : null}

                    <Text as="span" srOnly>{item.label}</Text>

                </Chip>

            ))}

        </Stack>

    );

}
