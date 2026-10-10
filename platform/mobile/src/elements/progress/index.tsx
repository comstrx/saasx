import { View } from "react-native";
import Animated from "react-native-reanimated";
import { useGlide } from "@/elements/motion";
import type { ToneName } from "@/theme/roles";
import { useTheme } from "@/theme/use-theme";

type ProgressProps = {
    value: number;
    tint?: ToneName | undefined;
    height?: number | undefined;
};

export function Progress ({ value, tint = "brand", height }: ProgressProps) {

    const theme = useTheme();
    const hue = theme.tone[tint];
    const rail = height ?? theme.space["2"];
    const held = Math.max(0, Math.min(1, value));

    const grow = useGlide("settle", "width");

    return (
        <View style={{ height: rail, borderRadius: theme.radius.pill, backgroundColor: theme.plane.groove, overflow: "hidden" }}>
            <Animated.View
                style={{
                    width: `${ held * 100 }%`,
                    height: rail,
                    borderRadius: theme.radius.pill,
                    backgroundColor: hue.base,
                    ...grow,
                }}
            />
        </View>
    );

}
