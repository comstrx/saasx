"use client";

import TabBar from "@/elements/tab-bar";
import { type TabBadge, useNavTabs } from "@/hooks/use-nav-tabs";
import Icon, { isIconName } from "@/icons/icon";

type Item = { key: string; href: string; label: string; icon: string | null; current: boolean; badge: TabBadge | null };
type Props = { label: string; items: readonly Item[] };

export default function NavTabs ({ label, items }: Props) {

    const counts = useNavTabs(items.flatMap(( item ) => (item.badge ? [item.badge] : [])));

    return (

        <TabBar
            label={label}
            items={items.map(( item ) => ({
                key: item.key,
                href: item.href,
                label: item.label,
                active: item.current,
                count: item.badge ? counts[item.badge] : 0,
                icon: isIconName(item.icon) ? <Icon name={item.icon} weight={item.current ? "fill" : "regular"} /> : null,
            }))}
        />

    );

}
