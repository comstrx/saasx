import { Stack } from "expo-router";
import { I18nManager } from "react-native";
import Replayer from "@/components/replayer";
import Status from "@/elements/status";
import { routing } from "@/lib/spec/config";
import { languages } from "@/lib/spec/languages";
import { SessionProvider } from "@/stores/provider";

const rtl = languages[routing.defaultLocale].direction === "rtl";

I18nManager.allowRTL(rtl);

if ( I18nManager.isRTL !== rtl ) I18nManager.forceRTL(rtl);

export default function RootLayout () {
    return (

        <SessionProvider>

            <Replayer />

            <Status scheme="auto" />

            <Stack screenOptions={{ headerShown: false }} />

        </SessionProvider>

    );
}
