import type { ReactNode } from "react";
import { View } from "react-native";
import { Icon, type IconName } from "@/elements/icon";
import type { ToneName } from "@/theme/roles";
import { useTheme } from "@/theme/use-theme";

type PlateLook = "solid" | "soft" | "paper" | "quiet" | "square" | "vivid";

type PlateProps = {
    icon?: IconName | undefined;
    children?: ReactNode | undefined;
    size?: number | undefined;
    tone?: ToneName | undefined;
    look?: PlateLook | undefined;
};

export function Plate ({ icon, children, size = 44, tone = "brand", look = "soft" }: PlateProps) {

    const theme = useTheme();
    const hue = theme.tone[tone];

    if ( look === "square" ) return (
        <View style={{ width: size, height: size, borderRadius: Math.round(size * 0.28), backgroundColor: hue.vivid, alignItems: "center", justifyContent: "center" }}>
            {icon ? <Icon name={icon} size={Math.round(size * 0.64)} color={theme.material.lit} fill /> : children}
        </View>
    );

    if ( look === "vivid" ) return (
        <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: hue.vivid, alignItems: "center", justifyContent: "center" }}>
            {icon ? <Icon name={icon} size={Math.round(size * 0.52)} color={theme.material.lit} fill /> : children}
        </View>
    );

    const fill = look === "solid" ? hue.base : look === "soft" ? hue.soft : look === "quiet" ? theme.plane.well : theme.plane.base;
    const paint = look === "solid" ? hue.on : hue.onSoft;

    return (
        <View
            style={{
                width: size,
                height: size,
                borderRadius: size / 2,
                backgroundColor: fill,
                alignItems: "center",
                justifyContent: "center",
                boxShadow: theme.depth.lift.boxShadow,
            }}
        >
            {icon ? <Icon name={icon} size={Math.round(size * 0.46)} color={paint} /> : children}
        </View>
    );

}
