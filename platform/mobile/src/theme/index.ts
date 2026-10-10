import { Appearance } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { usePrefs } from "@/store/prefs";
import { depths } from "@/theme/depth";
import { families } from "@/theme/fonts";
import { cartography } from "@/theme/map";
import { beats, curves, fade, sink, springs, swell, travel } from "@/theme/motion";
import { darkRoles, lightRoles, type Roles } from "@/theme/roles";
import { ranks } from "@/theme/text";
import { art, composition, control, hit, icon, layer, layout, mark, material, radius, ratio, sheet, space, stroke, tag, toggle } from "@/theme/tokens";

const shared = {
    material, composition, radius, space, layout, sheet, control, icon, art, mark, stroke, hit, ratio, travel, sink, swell, fade, toggle, layer, tag,
    fonts: families,
    text: ranks,
    spring: springs,
    curve: curves,
    beat: beats,
} as const;

const dress = <N extends "light" | "dark">( name: N, roles: Roles ) => {

    const depth = depths(roles);

    return {
        ...shared,
        ...roles,
        name,
        depth,
        map: cartography(roles),
        card: { ...depth.lift, borderRadius: radius.card, backgroundColor: roles.plane.base },
    };

};

export const themes = {
    light: dress("light", lightRoles),
    dark: dress("dark", darkRoles),
};

export type AppTheme = ( typeof themes )[keyof typeof themes];

export const systemTheme = (): keyof typeof themes => Appearance.getColorScheme() === "dark" ? "dark" : "light";

export const modeTheme = ( mode: "system" | "light" | "dark" ): keyof typeof themes => mode === "system" ? systemTheme() : mode;

StyleSheet.configure({
    themes,
    settings: { adaptiveThemes: false, initialTheme: modeTheme(usePrefs.getState().theme) },
});

declare module "react-native-unistyles" {

    export interface UnistylesThemes {
        light: ( typeof themes )["light"];
        dark: ( typeof themes )["dark"];
    }

}
