import { memo } from "react";
import { StyleSheet } from "react-native";
import Svg, { Defs, G, LinearGradient, Path, Pattern, Rect, Stop } from "react-native-svg";
import type { IconName } from "@/elements/icon";
import { iconPaths } from "@/elements/icon/paths";
import { useTheme } from "@/theme/use-theme";

type Doodle = { name: IconName; x: number; y: number; size: number; turn: number };

const doodles: readonly Doodle[] = [
    { name: "travel", x: 16, y: 12, size: 30, turn: -18 },
    { name: "luggage", x: 132, y: 28, size: 28, turn: 12 },
    { name: "location", x: 74, y: 80, size: 26, turn: -6 },
    { name: "camera", x: 184, y: 100, size: 26, turn: 16 },
    { name: "compass", x: 20, y: 138, size: 28, turn: 8 },
    { name: "globe", x: 116, y: 152, size: 30, turn: -12 },
    { name: "ticket", x: 196, y: 196, size: 26, turn: -22 },
    { name: "sun", x: 58, y: 204, size: 24, turn: 0 },
];

const grid = 256;

export const Wallpaper = memo(function Wallpaper () {

    const theme = useTheme();
    const tile = theme.composition.bubble.tile;

    return (
        <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
            <Defs>
                <LinearGradient id="wash" x1="0" y1="0" x2="0" y2="1">
                    <Stop offset="0" stopColor={theme.chat.wallTop} />
                    <Stop offset="1" stopColor={theme.chat.wallBottom} />
                </LinearGradient>

                <Pattern id="doodle" patternUnits="userSpaceOnUse" width={tile} height={tile}>
                    {doodles.map(( doodle ) => (
                        <G key={doodle.name} transform={`translate(${ doodle.x } ${ doodle.y }) rotate(${ doodle.turn } ${ doodle.size / 2 } ${ doodle.size / 2 }) scale(${ doodle.size / grid })`}>
                            {iconPaths[doodle.name].map(( shape ) => <Path key={shape} d={shape} fill={theme.chat.doodle} />)}
                        </G>
                    ))}
                </Pattern>
            </Defs>

            <Rect width="100%" height="100%" fill="url(#wash)" />
            <Rect width="100%" height="100%" fill="url(#doodle)" />
        </Svg>
    );

});
