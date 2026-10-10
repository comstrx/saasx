import type { BottomTabBarProps } from "expo-router/tabs";
import { useTranslation } from "react-i18next";
import { BottomNavigation } from "@/components/bottom-navigation";
import type { IconName } from "@/elements/icon";

type Slot = { name: string; icon: IconName; label: string };

const slots: readonly Slot[] = [
    { name: "index", icon: "tabHome", label: "tabs.home" },
    { name: "favorites", icon: "tabFavorites", label: "tabs.favorites" },
    { name: "orders", icon: "tabOrders", label: "tabs.orders" },
    { name: "chat", icon: "tabChat", label: "tabs.chat" },
    { name: "account", icon: "tabAccount", label: "tabs.account" },
];

export function TabBar ({ state, navigation }: BottomTabBarProps) {

    const { t } = useTranslation();
    const active = state.routes[state.index]?.name;

    const items = slots.flatMap(( slot ) => {

        const route = state.routes.find(( entry ) => entry.name === slot.name );

        if ( !route ) return [];

        const here = active === route.name;

        return [ {
            key: route.key,
            icon: slot.icon,
            label: t(slot.label),
            selected: here || ( active === "explore" && route.name === "index" ),
            onPress: () => {
                const event = navigation.emit({ type: "tabPress", target: route.key, canPreventDefault: true });
                if ( !here && !event.defaultPrevented ) navigation.navigate(route.name);
            },
            onLongPress: () => { navigation.emit({ type: "tabLongPress", target: route.key }); },
        } ];

    });

    return <BottomNavigation items={items} />;

}
