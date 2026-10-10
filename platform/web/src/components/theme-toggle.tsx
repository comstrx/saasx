"use client";

import Pebble from "@/elements/pebble";
import { useThemeToggle } from "@/hooks/use-theme-toggle";
import Icon from "@/icons/icon";

export default function ThemeToggle () {

    const theme = useThemeToggle();

    if ( !theme.available ) return null;

    return (

        <Pebble label={theme.label} pressed={theme.dark} plain onClick={theme.toggle}>

            <Icon name={theme.dark ? "sun" : "moon"} />

        </Pebble>

    );

}
