import { useState } from "react";
import { I18nManager, type LayoutChangeEvent, View } from "react-native";
import Animated, { FadeIn, ReduceMotion } from "react-native-reanimated";
import { useUnistyles } from "react-native-unistyles";
import { Icon, type IconName } from "@/elements/icon";
import { useGlide } from "@/elements/motion";
import { Press } from "@/elements/press";
import { Text } from "@/elements/text";
import { useTheme } from "@/theme/use-theme";

export type NavigationItem = {
    key: string;
    icon: IconName;
    label: string;
    selected: boolean;
    onPress: () => void;
    onLongPress?: (() => void) | undefined;
};

type Span = { x: number; w: number };

export function BottomNavigation ({ items }: { items: readonly NavigationItem[] }) {

    const theme = useTheme();
    const { rt: { insets } } = useUnistyles();
    const metric = theme.composition.navigation;
    const [ spans, setSpans ] = useState<Readonly<Record<string, Span>>>({});
    const [ rise, setRise ] = useState<number | null>(null);
    const slide = useGlide("snap", [ "start" ]);

    const live = items.find(( item ) => item.selected );
    const seat = live ? spans[live.key] : undefined;
    const lead = items[0] ? spans[items[0].key] : undefined;
    const offset = seat && lead ? ( I18nManager.isRTL ? lead.x + lead.w - ( seat.x + seat.w ) : seat.x - lead.x ) : null;

    const measure = ( key: string ) => ( event: LayoutChangeEvent ) => {

        const { x: at, width } = event.nativeEvent.layout;

        setSpans(( current ) => current[key]?.x === at && current[key]?.w === width ? current : { ...current, [key]: { x: at, w: width } });

    };

    return (
        <View
            style={{
                position: "absolute",
                bottom: insets.bottom + theme.layout.dockBottom,
                insetInlineStart: theme.layout.dockInset,
                insetInlineEnd: theme.layout.dockInset,
                minHeight: metric.height,
                paddingVertical: metric.pad,
                paddingHorizontal: metric.padX,
                borderRadius: theme.radius.pill,
                backgroundColor: theme.plane.base,
                ...theme.depth.float,
                borderWidth: theme.stroke.thin,
                borderColor: theme.line.soft,
            }}
        >
            <View style={{ flexGrow: 1, flexDirection: "row" }}>
                {seat && offset !== null && rise !== null ? (
                    <Animated.View
                        pointerEvents="none"
                        entering={FadeIn.duration(theme.beat.quick).reduceMotion(ReduceMotion.System)}
                        style={{
                            position: "absolute",
                            top: rise,
                            start: offset + ( seat.w - metric.indicator.width ) / 2,
                            width: metric.indicator.width,
                            height: metric.indicator.height,
                            borderRadius: theme.radius.pill,
                            backgroundColor: theme.tone.brand.soft,
                            ...slide,
                        }}
                    />
                ) : null}

                {items.map(( item ) => {

                    const ink = item.selected ? theme.tone.brand.onSoft : theme.ink.strong;

                    return (
                        <Press
                            key={item.key}
                            onLayout={measure(item.key)}
                            onPress={item.onPress}
                            onLongPress={item.onLongPress}
                            accessibilityRole="tab"
                            accessibilityLabel={item.label}
                            accessibilityState={{ selected: item.selected }}
                            feel="dim"
                            style={{ flex: 1, minHeight: metric.height - metric.pad * 2, alignItems: "center", justifyContent: "center", gap: metric.gap }}
                        >
                            <View
                                onLayout={( event ) => setRise(event.nativeEvent.layout.y) }
                                style={{ width: metric.indicator.width, height: metric.indicator.height, alignItems: "center", justifyContent: "center" }}
                            >
                                <Icon name={item.icon} size={metric.icon} color={ink} fill={item.selected} />
                            </View>

                            <Text rank={item.selected ? "micro" : "note"} color={ink} align="center" numberOfLines={1}>{item.label}</Text>
                        </Press>
                    );

                })}
            </View>
        </View>
    );

}
