import { type ReactNode, useRef, useState } from "react";
import { type NativeScrollEvent, type NativeSyntheticEvent, ScrollView, View } from "react-native";
import { useReducedMotion } from "react-native-reanimated";
import { Badge } from "@/elements/badge";
import { Dots } from "@/elements/dots";
import { Facts } from "@/elements/facts";
import { type Flight, useFlight } from "@/elements/flight";
import { Heart } from "@/elements/heart";
import { Icon, type IconName } from "@/elements/icon";
import { Media, rungFor } from "@/elements/media";
import { Press } from "@/elements/press";
import { Price } from "@/elements/price";
import { Rating } from "@/elements/rating";
import { leadOf } from "@/elements/scroll/lead";
import { Text } from "@/elements/text";
import type { Picture } from "@/std/picture";
import type { ToneName } from "@/theme/roles";
import { useScript } from "@/theme/use-script";
import { useTheme } from "@/theme/use-theme";

export type TileShape = "stack" | "row" | "wide" | "panel";

type TilePrice = {
    amount: string;
    was?: string | undefined;
    unit?: string | undefined;
};

export type TileProps = {
    title: string;
    image?: Picture | string | null | undefined;
    images?: readonly Picture[] | undefined;
    note?: string | undefined;
    icon?: IconName | undefined;
    score?: number | undefined;
    reviews?: number | undefined;
    price?: TilePrice | undefined;
    ask?: string | undefined;
    facts?: readonly ( string | null | undefined )[] | undefined;
    tag?: { label: string; tint?: ToneName; glass?: boolean } | undefined;
    loved?: boolean | undefined;
    loveLabel?: string | undefined;
    onLove?: (( next: boolean ) => void) | undefined;
    onPress?: (() => void) | undefined;
    shape?: TileShape | undefined;
    alone?: boolean | undefined;
    width?: number | undefined;
    flight?: Flight | undefined;
};

type ShotsProps = {
    shots: readonly Picture[];
    icon: IconName | undefined;
    ratio: number;
    flush: boolean;
    children: ReactNode;
};

function Shots ({ shots, icon, ratio, flush, children }: ShotsProps) {

    const theme = useTheme();
    const [ span, setSpan ] = useState(0);
    const [ seat, setSeat ] = useState(0);

    const settle = ( event: NativeSyntheticEvent<NativeScrollEvent> ) => {

        if ( span > 0 ) setSeat(Math.round(leadOf(event.nativeEvent) / span));

    };

    return (
        <View
            onLayout={( event ) => setSpan(Math.round(event.nativeEvent.layout.width)) }
            style={{ aspectRatio: ratio, borderRadius: flush ? 0 : theme.radius.card, overflow: "hidden", backgroundColor: theme.plane.sunken }}
        >
            {span > 0 ? (
                <ScrollView horizontal pagingEnabled nestedScrollEnabled showsHorizontalScrollIndicator={false} onMomentumScrollEnd={settle}>
                    {shots.map(( shot, index ) => Math.abs(index - seat) <= 1
                        ? <Media key={shot.uri} source={shot} icon={icon} ratio={ratio} style={{ width: span }} />
                        : <View key={shot.uri} style={{ width: span, aspectRatio: ratio }} /> )}
                </ScrollView>
            ) : null}

            {children}

            <View pointerEvents="none" style={{ position: "absolute", bottom: theme.space["2"], insetInlineStart: 0, insetInlineEnd: 0, alignItems: "center" }}>
                <View style={{ paddingHorizontal: theme.space["2"], paddingVertical: theme.space["1"], borderRadius: theme.radius.pill, backgroundColor: theme.photo.chip }}>
                    <Dots count={shots.length} index={seat} lit />
                </View>
            </View>
        </View>
    );

}

export function Tile ({ title, image, images, note, icon, score, reviews, price, ask, facts, tag, loved, loveLabel, onLove, onPress, shape = "stack", alone = false, width, flight }: TileProps) {

    const theme = useTheme();
    const script = useScript();
    const lined = shape === "row";
    const panel = shape === "panel";
    const rated = score !== undefined && score > 0;
    const ratio = lined ? theme.ratio.square : shape === "wide" || panel ? theme.ratio.wide : theme.ratio.photo;
    const paged = !lined && images !== undefined && images.length > 1 ? images : null;
    const frame = useRef<View>(null);
    const still = useReducedMotion();
    const launch = useFlight(( tower ) => tower.launch );
    const face = image ?? images?.[0] ?? null;

    const open = () => {

        if ( !onPress ) return;

        const view = frame.current;

        onPress();

        if ( !flight || still || !face || !view ) return;

        view.measureInWindow(( x, y, w, h ) => {

            const uri = rungFor(face, w);

            if ( uri && w > 0 && h > 0 ) launch({ ...flight, uri, from: { x, y, w, h, r: paged ? theme.radius.card : theme.radius.tile } });

        });

    };

    const marks = (
        <>
            {tag && !lined ? (
                <View style={{ position: "absolute", top: theme.space["2"], insetInlineStart: theme.space["2"] }}>
                    <Badge label={tag.label} tint={tag.tint ?? "brand"} solid={!tag.glass} glass={tag.glass} />
                </View>
            ) : null}

            {onLove ? (
                <View style={{ position: "absolute", top: theme.space["2"], insetInlineEnd: theme.space["2"] }}>
                    <Heart on={loved ?? false} onChange={onLove} label={loveLabel} size={theme.control.sm.height - ( lined ? theme.space["2"] : 0 )} glass />
                </View>
            ) : null}
        </>
    );

    const art = paged ? <Shots key={paged[0]?.uri} shots={paged} icon={icon} ratio={ratio} flush={panel}>{marks}</Shots> : (
        <Media
            source={image}
            icon={icon}
            ratio={ratio}
            curve={panel ? undefined : "tile"}
            style={lined ? { width: theme.layout.thumb } : undefined}
        >
            {marks}
        </Media>
    );

    const cash = price
        ? <Price amount={price.amount} unit={price.unit} rank={lined ? "title" : "label"} />
        : ask
            ? <Text rank="label" ink="soft">{ask}</Text>
            : null;

    const trust = rated && !lined ? (
        <View style={{ flexDirection: "row", alignItems: "center", gap: theme.space["1"] }}>
            <Icon name="ratingStar" size={theme.icon.sm} tint="star" fill />
            <Text rank="caption" ink="soft" ltr figures>{score.toFixed(1)}</Text>
        </View>
    ) : null;

    const body = (
        <View style={{ flex: lined ? 1 : undefined, gap: theme.space["2"], justifyContent: "center", padding: panel ? theme.space["4"] : undefined }}>
            <View style={{ flexDirection: "row", alignItems: "flex-start", gap: theme.space["2"] }}>
                <Text rank="title" numberOfLines={2} style={{ flexShrink: 1, minHeight: panel && !alone ? theme.text.title[script].height * 2 : undefined }}>{title}</Text>

                {tag && lined ? <Badge label={tag.label} tint={tag.tint ?? "brand"} /> : null}
            </View>

            {trust || note ? (
                <View style={{ flexDirection: "row", alignItems: "center", gap: theme.space["2"] }}>
                    {trust}

                    {trust && note ? <Text rank="caption" ink="faint">·</Text> : null}

                    {note ? <Text rank="caption" ink="soft" numberOfLines={1} style={{ flexShrink: 1 }}>{note}</Text> : null}
                </View>
            ) : null}

            {facts?.length ? <Facts items={facts} /> : null}

            {rated && lined ? <Rating score={score} reviews={reviews} /> : null}

            {cash ? <View style={{ paddingTop: theme.space["1"] }}>{cash}</View> : null}
        </View>
    );

    return (
        <Press
            accessibilityRole={onPress ? "button" : "none"}
            accessibilityLabel={title}
            onPress={open}
            disabled={!onPress}
            sink={lined ? "card" : "tile"}
            style={[
                { width },
                lined ? {
                    ...theme.card,
                    flexDirection: "row",
                    alignItems: "stretch",
                    gap: theme.space["3"],
                    padding: theme.space["3"],
                    borderRadius: theme.radius.card,
                    backgroundColor: theme.plane.base,
                } : panel ? { ...theme.card, overflow: "hidden" } : { gap: theme.space["3"] },
            ]}
        >
            <View ref={frame} collapsable={false}>{art}</View>
            {body}
        </Press>
    );

}
