import { useEffect, useRef, useState } from "react";
import { I18nManager, type LayoutChangeEvent, Pressable, ScrollView, View } from "react-native";
import Animated, { FadeIn, ReduceMotion } from "react-native-reanimated";
import { Icon, type IconName } from "@/elements/icon";
import { useGlide } from "@/elements/motion";
import { useSurface } from "@/elements/surface";
import { Text } from "@/elements/text";
import { above } from "@/theme/roles";
import { useTheme } from "@/theme/use-theme";

export type Tab<K extends string> = {
    key: K;
    label: string;
    icon?: IconName | undefined;
    count?: number | undefined;
};

type TabsLook = "pill" | "track" | "capsule" | "segment";

type TabsProps<K extends string> = {
    options: readonly Tab<K>[];
    active: K;
    onPick: ( key: K ) => void;
    look?: TabsLook | undefined;
};

type Span = { x: number; w: number };

function Tally ({ count, live }: { count: number; live: boolean }) {

    const theme = useTheme();

    return (
        <Text
            rank="micro"
            ltr
            figures
            align="center"
            color={live ? theme.tone.brand.on : theme.ink.soft}
            style={{
                minWidth: theme.tag.md,
                paddingHorizontal: theme.space["1.5"],
                overflow: "hidden",
                borderRadius: theme.radius.pill,
                backgroundColor: live ? theme.tone.brand.bright : theme.plane.well,
            }}
        >
            {count}
        </Text>
    );

}

function Capsule<K extends string> ({ options, active, onPick, dense }: TabsProps<K> & { dense: boolean }) {

    const theme = useTheme();
    const surface = useSurface();
    const capsule = theme.composition.capsule;
    const seatTall = dense ? capsule.seat : capsule.tall;
    const reach = Math.max(0, ( theme.hit.min - seatTall ) / 2);
    const [ spans, setSpans ] = useState<Readonly<Record<string, Span>>>({});
    const [ room, setRoom ] = useState(0);
    const seat = spans[active];
    const lead = options[0] ? spans[options[0].key] : undefined;
    const rail = useRef<ScrollView>(null);
    const touched = useRef(false);

    const slide = useGlide("snap", [ "start", "width" ]);
    const offset = seat && lead ? ( I18nManager.isRTL ? lead.x + lead.w - ( seat.x + seat.w ) : seat.x - lead.x ) : null;

    useEffect(() => {

        if ( !seat || !touched.current ) return;

        rail.current?.scrollTo({ x: Math.max(0, seat.x + seat.w / 2 - room / 2), animated: true });

    }, [ seat, room ]);

    const measure = ( key: K ) => ( event: LayoutChangeEvent ) => {

        const { x: at, width } = event.nativeEvent.layout;

        setSpans(( current ) => current[key]?.x === at && current[key]?.w === width ? current : { ...current, [key]: { x: at, w: width } });

    };

    const pick = ( key: K ) => {

        touched.current = true;
        onPick(key);

    };

    return (
        <View
            onLayout={( event ) => setRoom(Math.round(event.nativeEvent.layout.width) - capsule.pad * 2)}
            style={{
                overflow: "hidden",
                padding: capsule.pad,
                borderRadius: theme.radius.pill,
                backgroundColor: theme.plane[above(surface, theme.name === "dark")],
            }}
        >
            <ScrollView
                ref={rail}
                horizontal
                showsHorizontalScrollIndicator={false}
                onScrollBeginDrag={() => { touched.current = true; }}
                onContentSizeChange={() => { if ( I18nManager.isRTL && !touched.current ) rail.current?.scrollToEnd({ animated: false }); }}
                style={{ flexGrow: 0, borderRadius: theme.radius.pill }}
                contentContainerStyle={room > 0 && !dense ? { minWidth: room } : undefined}
            >
                <View style={{ flexGrow: 1, flexDirection: "row" }}>
                    {seat && offset !== null ? (
                        <Animated.View
                            entering={FadeIn.duration(theme.beat.quick).reduceMotion(ReduceMotion.System)}
                            style={{
                                position: "absolute",
                                top: 0,
                                bottom: 0,
                                start: offset,
                                width: seat.w,
                                borderRadius: theme.radius.pill,
                                backgroundColor: theme.tone.brand.soft,
                                ...slide,
                            }}
                        />
                    ) : null}

                    {options.map(( option ) => {

                        const live = option.key === active;
                        const ink = live ? theme.tone.brand.onSoft : theme.ink.soft;

                        return (
                            <Pressable
                                key={option.key}
                                onLayout={measure(option.key)}
                                accessibilityRole="tab"
                                accessibilityState={{ selected: live }}
                                accessibilityLabel={option.label}
                                onPress={() => pick(option.key)}
                                hitSlop={{ top: reach, bottom: reach }}
                                style={{
                                    flexGrow: dense ? 0 : 1,
                                    flexDirection: "row",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: theme.control.md.gap,
                                    minHeight: seatTall,
                                    paddingHorizontal: capsule.padX,
                                    borderRadius: theme.radius.pill,
                                }}
                            >
                                {option.icon ? <Icon name={option.icon} size={theme.icon.md} color={ink} fill={live} /> : null}

                                <Text rank="action" color={ink} numberOfLines={1}>{option.label}</Text>

                                {option.count === undefined ? null : <Tally count={option.count} live={live} />}
                            </Pressable>
                        );

                    })}
                </View>
            </ScrollView>
        </View>
    );

}

function Segment<K extends string> ({ options, active, onPick }: TabsProps<K>) {

    const theme = useTheme();
    const surface = useSurface();
    const [ span, setSpan ] = useState(0);
    const index = Math.max(0, options.findIndex(( option ) => option.key === active ));
    const metric = theme.composition.segment;
    const pad = metric.padX;

    const slot = span > 0 ? ( span - pad * 2 ) / options.length : 0;
    const slide = useGlide("snap", "transform");

    const measure = ( event: LayoutChangeEvent ) => setSpan(Math.round(event.nativeEvent.layout.width) );

    return (
        <View
            onLayout={measure}
            style={{
                flexDirection: "row",
                paddingHorizontal: pad,
                paddingVertical: metric.padY,
                minHeight: theme.control.md.height,
                borderRadius: theme.radius.pill,
                backgroundColor: theme.plane[above(surface, theme.name === "dark")],
            }}
        >
            {slot > 0 ? (
                <Animated.View
                    style={{
                        position: "absolute",
                        top: metric.padY,
                        bottom: metric.padY,
                        insetInlineStart: pad,
                        width: slot,
                        borderRadius: theme.radius.pill,
                        backgroundColor: theme.tone.brand.soft,
                        transform: [ { translateX: index * slot * ( I18nManager.isRTL ? -1 : 1 ) } ],
                        ...slide,
                    }}
                />
            ) : null}

            {options.map(( option ) => {

                const live = option.key === active;
                const ink = live ? theme.tone.brand.onSoft : theme.ink.soft;

                return (
                    <Pressable
                        key={option.key}
                        accessibilityRole="tab"
                        accessibilityState={{ selected: live }}
                        onPress={() => onPick(option.key)}
                        hitSlop={{ top: ( theme.hit.min - metric.itemHeight ) / 2, bottom: ( theme.hit.min - metric.itemHeight ) / 2 }}
                        style={{ flex: 1, minHeight: metric.itemHeight, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: theme.control.md.gap }}
                    >
                        {option.icon ? <Icon name={option.icon} size={theme.icon.md} color={ink} fill={live} /> : null}

                        <Text rank="action" color={ink}>{option.label}</Text>
                    </Pressable>
                );

            })}
        </View>
    );

}

export function Tabs<K extends string> ({ look = "pill", ...props }: TabsProps<K>) {

    return look === "segment" ? <Segment {...props} /> : <Capsule {...props} dense={look === "capsule"} />;

}
