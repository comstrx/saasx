import type { ReactNode } from "react";
import { type StyleProp, View, type ViewProps, type ViewStyle } from "react-native";
import { Surface } from "@/elements/surface";
import type { DepthName } from "@/theme/depth";
import type { PlaneName } from "@/theme/roles";
import type { space } from "@/theme/tokens";
import { useTheme } from "@/theme/use-theme";

export type Step = keyof typeof space;
export type Curve = "pill" | "tag" | "control" | "tile" | "card" | "panel" | "sheet";
type Align = "start" | "center" | "end" | "stretch" | "baseline";
type Justify = "start" | "center" | "end" | "between";

type BoxProps = ViewProps & {
    children?: ReactNode;
    row?: boolean | undefined;
    gap?: Step | undefined;
    pad?: Step | undefined;
    padX?: Step | undefined;
    padY?: Step | undefined;
    align?: Align | undefined;
    justify?: Justify | undefined;
    flex?: number | undefined;
    wrap?: boolean | undefined;
    plane?: PlaneName | "none" | undefined;
    fill?: string | undefined;
    depth?: DepthName | undefined;
    curve?: Curve | undefined;
    clip?: boolean | undefined;
    style?: StyleProp<ViewStyle> | undefined;
};

const ends: Record<Align, ViewStyle["alignItems"]> = { start: "flex-start", center: "center", end: "flex-end", stretch: "stretch", baseline: "baseline" };

const spread: Record<Justify, ViewStyle["justifyContent"]> = { start: "flex-start", center: "center", end: "flex-end", between: "space-between" };

const raised: Record<DepthName, PlaneName> = { flat: "base", lift: "base", raise: "raised", float: "raised" };

export function Box ({ children, row = false, gap, pad, padX, padY, align, justify, flex, wrap = false, plane = "none", fill, depth, curve, clip = false, style, ...rest }: BoxProps) {

    const theme = useTheme();
    const night = theme.name === "dark";

    const shade: PlaneName | null = plane === "none" ? null : night && depth ? raised[depth] : plane;
    const painted = shade === null ? fill : theme.plane[shade];

    return (
        <View
            {...rest}
            style={[ {
                ...( row ? { flexDirection: "row", alignItems: align ? ends[align] : "center" } : align ? { alignItems: ends[align] } : {} ),
                ...( gap === undefined ? {} : { gap: theme.space[gap] } ),
                ...( pad === undefined ? {} : { padding: theme.space[pad] } ),
                ...( padX === undefined ? {} : { paddingHorizontal: theme.space[padX] } ),
                ...( padY === undefined ? {} : { paddingVertical: theme.space[padY] } ),
                ...( justify === undefined ? {} : { justifyContent: spread[justify] } ),
                ...( flex === undefined ? {} : { flex } ),
                ...( wrap ? { flexWrap: "wrap" } : {} ),
                ...( painted === undefined ? {} : { backgroundColor: painted } ),
                ...( curve === undefined ? {} : { borderRadius: theme.radius[curve] } ),
                ...( depth === undefined ? {} : theme.depth[depth] ),
                ...( clip ? { overflow: "hidden" } : {} ),
            }, style ]}
        >
            {shade === null ? children : <Surface value={shade}>{children}</Surface>}
        </View>
    );

}
