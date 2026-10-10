import type { ReactNode } from "react";
import { RefreshControl, ScrollView, type ScrollViewProps } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import Animated, { runOnJS, type SharedValue, useAnimatedScrollHandler, useSharedValue } from "react-native-reanimated";
import { useClearance, useFloor } from "@/elements/dock/floor";
import { usePullSkin } from "@/elements/pull";
import { useRail } from "@/elements/scroll/rail";
import { useTheme } from "@/theme/use-theme";

type ScrollProps = Omit<ScrollViewProps, "children" | "refreshControl" | "onScroll"> & {
    children: ReactNode;
    refreshing?: boolean | undefined;
    onRefresh?: (() => void) | undefined;
    mark?: number | undefined;
    onMark?: (( past: boolean ) => void) | undefined;
    track?: SharedValue<number> | undefined;
    keyboard?: boolean | undefined;
    docked?: boolean | undefined;
    bare?: boolean | undefined;
};

export function Scroll ({ children, refreshing = false, onRefresh, style, contentContainerStyle, mark, onMark, track, keyboard = false, docked = false, bare = false, horizontal = false, ...rest }: ScrollProps) {

    const theme = useTheme();
    const reserve = useFloor();
    const rail = useRail();
    const skin = usePullSkin();
    const past = useSharedValue(false);

    const frame = [ horizontal ? { flexGrow: 0 } : { flex: 1 }, { backgroundColor: "transparent" }, style ];
    const floor = useClearance(docked);
    const restBottom = reserve;
    const content = horizontal
        ? contentContainerStyle
        : [ { flexGrow: 1 }, contentContainerStyle, bare ? { paddingTop: 0, paddingBottom: restBottom, justifyContent: "center" as const } : { paddingBottom: floor } ];

    const pull = onRefresh
        ? <RefreshControl refreshing={refreshing} onRefresh={onRefresh} {...skin} />
        : undefined;

    const watch = useAnimatedScrollHandler(( event ) => {

        if ( track ) track.value = event.contentOffset.y;
        if ( rail && !horizontal ) rail.value = event.contentOffset.y;

        if ( mark === undefined ) return;

        const next = event.contentOffset.y > mark;

        if ( next === past.value ) return;

        past.value = next;

        if ( onMark ) runOnJS(onMark)(next);

    });

    if ( keyboard ) return (
        <KeyboardAwareScrollView
            {...rest}
            horizontal={horizontal}
            style={frame}
            contentContainerStyle={content}
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            bottomOffset={theme.space["7"]}
            refreshControl={pull}
        >
            {children}
        </KeyboardAwareScrollView>
    );

    if ( !onMark && !track && !rail ) return (
        <ScrollView
            {...rest}
            horizontal={horizontal}
            style={frame}
            contentContainerStyle={content}
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            refreshControl={pull}
        >
            {children}
        </ScrollView>
    );

    return (
        <Animated.ScrollView
            {...rest}
            horizontal={horizontal}
            style={frame}
            contentContainerStyle={content}
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            onScroll={watch}
            scrollEventThrottle={16}
            refreshControl={pull}
        >
            {children}
        </Animated.ScrollView>
    );

}
