import { useEffect } from "react";
import Replayer from "@/components/replayer";
import { SessionProvider } from "@/hooks/use-client";
import { useLocale, useTheme } from "@/hooks/use-locale";
import { languages } from "@/lib/spec/languages";
import { Navigator } from "./navigator";

function Document () {

    const locale = useLocale();
    const theme = useTheme();

    useEffect(() => {

        const root = document.documentElement;

        root.lang = locale;
        root.dir = languages[locale].direction;
        root.dataset.theme = theme;

    }, [locale, theme]);

    return null;

}
export default function App () {

    return (

        <SessionProvider>

            <Replayer />

            <Document />

            <Navigator />

        </SessionProvider>

    );

}
