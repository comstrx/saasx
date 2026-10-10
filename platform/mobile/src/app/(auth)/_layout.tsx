import { Stack } from "expo-router";
import { useTheme } from "@/theme/use-theme";

export default function AuthLayout () {

    const theme = useTheme();

    return (
        <Stack
            screenOptions={{
                headerShown: false,
                animation: "ios_from_right",
                animationDuration: theme.beat.base,
                gestureEnabled: true,
                contentStyle: { backgroundColor: theme.plane.canvas },
            }}
        >
            <Stack.Screen name="story" options={{ animation: "fade", gestureEnabled: false }} />
            <Stack.Screen name="back" options={{ animation: "fade", gestureEnabled: false }} />
            <Stack.Screen name="hello" options={{ animation: "fade", gestureEnabled: false }} />
            <Stack.Screen name="gate" options={{ animation: "fade_from_bottom" }} />
            <Stack.Screen name="verify" options={{ animation: "slide_from_bottom" }} />
            <Stack.Screen name="recovery" options={{ animation: "slide_from_bottom" }} />
        </Stack>
    );

}
