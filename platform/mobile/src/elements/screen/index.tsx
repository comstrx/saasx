import { useIsFocused } from "expo-router";
import type { ReactNode } from "react";
import { type NativeScrollEvent, type NativeSyntheticEvent, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useSharedValue } from "react-native-reanimated";
import { StyleSheet } from "react-native-unistyles";
import { MotionActivity } from "@/elements/motion/activity";
import { Rail } from "@/elements/scroll/rail";
import { Surface } from "@/elements/surface";
import type { PlaneName } from "@/theme/roles";
import { useTheme } from "@/theme/use-theme";

type Edge = "top" | "bottom" | "left" | "right";

type ScreenProps = {
    children: ReactNode;
    head?: ReactNode | undefined;
    edges?: readonly Edge[] | undefined;
    plane?: PlaneName | undefined;
    padded?: boolean | undefined;
    scroll?: boolean | undefined;
    centered?: boolean | undefined;
};

export function Screen ({ children, head, edges = [ "top", "bottom" ], plane = "canvas", padded = true, scroll = false, centered = false }: ScreenProps) {

    const theme = useTheme();
    const focused = useIsFocused();
    const rail = useSharedValue(0);

    const ride = ( event: NativeSyntheticEvent<NativeScrollEvent> ) => {

        rail.value = event.nativeEvent.contentOffset.y;

    };

    const body = {
        flexGrow: 1,
        paddingHorizontal: padded ? theme.layout.gutter : 0,
        justifyContent: centered ? "center" as const : "flex-start" as const,
    };

    return (
        <MotionActivity active={focused}>
        <Rail value={rail}>
        <Surface value={plane}>
            <View style={[ styles.frame(edges), { backgroundColor: theme.plane[plane] } ]}>
                {head}

                {scroll ? (
                    <KeyboardAwareScrollView
                        contentContainerStyle={body}
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}
                        bottomOffset={theme.control.lg.height + theme.space["6"]}
                        onScroll={ride}
                        scrollEventThrottle={16}
                    >
                        {children}
                    </KeyboardAwareScrollView>
                ) : <View style={[ body, { flex: 1, minHeight: 0 } ]}>{children}</View>}

                {edges.includes("bottom") ? null : <View pointerEvents="none" style={[ styles.floor, { backgroundColor: theme.plane[plane] } ]} />}
            </View>
        </Surface>
        </Rail>
        </MotionActivity>
    );

}

const styles = StyleSheet.create(( theme, runtime ) => ({

    frame: ( edges: readonly Edge[] ) => ({
        flex: 1,
        paddingTop: edges.includes("top") ? runtime.insets.top : 0,
        paddingBottom: edges.includes("bottom") ? runtime.insets.bottom : 0,
        paddingLeft: edges.includes("left") ? runtime.insets.left : 0,
        paddingRight: edges.includes("right") ? runtime.insets.right : 0,
    }),
    floor: {
        position: "absolute",
        insetInlineStart: 0,
        insetInlineEnd: 0,
        bottom: 0,
        height: runtime.insets.bottom,
        zIndex: theme.layer.raised,
    },

}));
