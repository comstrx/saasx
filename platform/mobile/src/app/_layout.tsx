import "@/theme";

import { Stack } from "expo-router";
import { FlightHost } from "@/elements/flight";
import { Boot } from "@/features/boot";
import { useDeepLink } from "@/features/boot/deeplink";
import { push } from "@/theme/motion";
import { useTheme } from "@/theme/use-theme";

export const unstable_settings = { initialRouteName: "(tabs)" };

export default function RootLayout () {

    const theme = useTheme();

    useDeepLink();

    return (
        <Boot>
            <Stack
                screenOptions={{
                    headerShown: false,
                    animation: push,
                    animationDuration: theme.beat.calm,
                    fullScreenGestureEnabled: true,
                    freezeOnBlur: false,
                    contentStyle: { backgroundColor: theme.plane.canvas },
                }}
            >
                <Stack.Screen name="checkout" options={{ animation: "slide_from_bottom", gestureDirection: "vertical" }} />
                <Stack.Screen name="cart" options={{ animation: "slide_from_bottom", gestureDirection: "vertical" }} />
                <Stack.Screen name="thanks" options={{ animation: "fade", gestureEnabled: false }} />
                <Stack.Screen name="payment/return" options={{ animation: "fade", gestureEnabled: false }} />
                <Stack.Screen name="auth/reset" options={{ animation: "slide_from_bottom" }} />
                <Stack.Screen name="+not-found" options={{ animation: "fade_from_bottom" }} />
                <Stack.Screen name="catalog/[id]" options={{ animation: "fade", animationDuration: theme.beat.base }} />
            </Stack>

            <FlightHost />
        </Boot>
    );

}
