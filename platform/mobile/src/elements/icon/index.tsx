import { I18nManager, View } from "react-native";
import Svg, { Path } from "react-native-svg";
import { filledIcons, type IconName, iconPaths, mirroredIcons, solidPaths } from "@/elements/icon/paths";
import type { InkName, ToneName } from "@/theme/roles";
import { useTheme } from "@/theme/use-theme";

export type { IconName };

type IconTint = InkName | ToneName | "star" | "lit";

type IconWeight = "hair" | "light" | "regular" | "bold";

type IconProps = {
    name: IconName;
    size?: number | undefined;
    tint?: IconTint | undefined;
    weight?: IconWeight | undefined;
    fill?: boolean | undefined;
    color?: string | undefined;
    inline?: boolean | undefined;
};

const grid = 256;

const drawn = 16;

const weights: Record<IconWeight, number> = { hair: 1.25, light: 1.5, regular: 1.75, bold: 2.1 };

const optical = ( size: number, weight: IconWeight ): number => Math.max(0, Math.round(( weights[weight] * ( 24 / size ) ** 0.6 * grid / 24 - drawn ) * 10 ) / 10);

export const chevronNext: IconName = I18nManager.isRTL ? "back" : "forward";
export const arrowNext: IconName = I18nManager.isRTL ? "arrowBack" : "arrowForward";
export const arrowBack: IconName = I18nManager.isRTL ? "arrowForward" : "arrowBack";

export function Icon ({ name, size = 20, tint = "base", weight = "regular", fill = false, color, inline = false }: IconProps) {

    const theme = useTheme();

    const paint = color
        ?? ( tint === "star" ? theme.star : undefined )
        ?? ( tint === "lit" ? theme.material.lit : undefined )
        ?? ( tint in theme.ink ? theme.ink[tint as InkName] : theme.tone[tint as ToneName].base );

    const held = fill ? solidPaths[name] : undefined;
    const solid = held !== undefined || filledIcons.has(name);
    const flip = I18nManager.isRTL && mirroredIcons.has(name);
    const swell = solid ? 0 : optical(size, weight);

    return (
        <View
            style={{
                width: size,
                height: size,
                alignItems: "center",
                justifyContent: "center",
                marginTop: inline ? -Math.round(size * 0.08) : 0,
                transform: flip ? [ { scaleX: -1 } ] : [],
            }}
        >
            <Svg width={size} height={size} viewBox={`0 0 ${ grid } ${ grid }`}>
                {( held ?? iconPaths[name] ).map(( shape ) => (
                    <Path
                        key={shape}
                        d={shape}
                        fill={paint}
                        stroke={paint}
                        strokeWidth={swell}
                        strokeLinejoin="round"
                    />
                ))}
            </Svg>
        </View>
    );

}
