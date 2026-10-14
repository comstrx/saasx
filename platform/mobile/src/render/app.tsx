import Replayer from "@/components/replayer";
import Status from "@/elements/status";
import { SessionProvider } from "@/hooks/use-client";
import { useTheme } from "@/hooks/use-locale";
import { applyDirection } from "@/lib/providers/direction";
import { SafeAreaProvider } from "@/lib/providers/safe-area";
import { routing } from "@/lib/spec/config";
import { languages } from "@/lib/spec/languages";
import { Navigator } from "./navigator";

applyDirection(languages[routing.defaultLocale].direction === "rtl");

function Bars () {

    return <Status scheme={useTheme() === "dark" ? "light" : "dark"} />;

}
export default function App () {

    return (

        <SafeAreaProvider>

            <SessionProvider>

                <Replayer />

                <Bars />

                <Navigator />

            </SessionProvider>

        </SafeAreaProvider>

    );

}
