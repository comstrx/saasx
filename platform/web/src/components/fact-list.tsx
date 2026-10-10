import Facts from "@/elements/facts";
import Icon, { isIconName } from "@/icons/icon";

type Props = { items: readonly { key: string; term: string; detail?: string; icon?: string }[]; compact?: boolean };

export default function FactList ({ items, compact }: Props) {

    return (

        <Facts compact={compact} items={items.map(( item ) => ({
            ...item,
            icon: item.icon ? <Icon name={isIconName(item.icon) ? item.icon : "info"} size="md" /> : undefined,
        }))} />

    );

}
