import { type Href, router, useRootNavigationState } from "expo-router";
import { type BottomTabBarProps, Tabs } from "expo-router/tabs";
import { useEffect, useRef } from "react";
import { useUnistyles } from "react-native-unistyles";
import { Floor } from "@/elements/dock/floor";
import { devRoute } from "@/features/boot/dev";
import { TabBar } from "@/features/shell";
import { useTheme } from "@/theme/use-theme";

const screenOptions = { headerShown: false, animation: "fade", tabBarPosition: "bottom", freezeOnBlur: true, sceneStyle: { backgroundColor: "transparent" } } as const;

const tabBar = ( props: BottomTabBarProps ) => <TabBar {...props} />;

function Steer ({ to }: { to: Href }) {

    const state = useRootNavigationState();
    const steered = useRef(false);

    useEffect(() => {

        if ( steered.current || !state?.key ) return;

        steered.current = true;
        router.replace(to);

    }, [ state?.key, to ]);

    return null;

}

export default function TabsLayout () {

    const theme = useTheme();
    const { rt: { insets } } = useUnistyles();
    const floor = insets.bottom + theme.layout.dockBottom + theme.composition.navigation.height;

    return (
        <Floor value={floor}>
            {__DEV__ && devRoute ? <Steer to={devRoute} /> : null}

            <Tabs tabBar={tabBar} screenOptions={screenOptions}>
                <Tabs.Screen name="index" />
                <Tabs.Screen name="chat" />
                <Tabs.Screen name="orders" />
                <Tabs.Screen name="favorites" />
                <Tabs.Screen name="account" />
                <Tabs.Screen name="explore" options={{ href: null }} />
            </Tabs>
        </Floor>
    );

}
