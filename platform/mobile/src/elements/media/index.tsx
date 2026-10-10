import { Image } from "expo-image";
import { type ReactNode, useMemo, useState } from "react";
import { type LayoutChangeEvent, PixelRatio, type StyleProp, StyleSheet, View, type ViewStyle } from "react-native";
import Animated, { FadeOut } from "react-native-reanimated";
import { Art, type Artwork } from "@/elements/art";
import type { Curve } from "@/elements/box";
import type { IconName } from "@/elements/icon";
import { useSurface } from "@/elements/surface";
import type { Picture } from "@/std/picture";
import { above } from "@/theme/roles";
import { useTheme } from "@/theme/use-theme";
import { veil } from "@/theme/wash";

const figures: Partial<Record<IconName, Artwork>> = {
    stay: "domain-hotel",
    tour: "domain-tour",
    travel: "domain-travel",
    ticket: "domain-ticket",
    visa: "domain-visa",
    product: "domain-product",
    service: "domain-service",
    event: "domain-event",
    shield: "domain-insurance",
};

type MediaProps = {
    source?: Picture | string | null | undefined;
    icon?: IconName | undefined;
    ratio?: number | null | undefined;
    curve?: Curve | undefined;
    scrim?: boolean | undefined;
    children?: ReactNode | undefined;
    style?: StyleProp<ViewStyle> | undefined;
    onReady?: (() => void) | undefined;
};

export const rungFor = ( source: Picture | string | null | undefined, width: number ): string | null => {

    const uri = typeof source === "string" ? source : source?.uri ?? null;

    if ( !uri ) return null;

    const ladder = typeof source === "string" ? [] : source?.rungs ?? [];

    if ( !ladder.length ) return uri;
    if ( width <= 0 ) return null;

    const need = width * PixelRatio.get();

    return ladder.find(( rung ) => rung.width >= need )?.uri ?? uri;

};

export function Media ({ source, icon = "image", ratio, curve, scrim = false, children, style, onReady }: MediaProps) {

    const theme = useTheme();
    const night = theme.name === "dark";
    const surface = useSurface();
    const backdrop = night ? theme.plane[above(surface, true)] : theme.plane.base;

    const [ failed, setFailed ] = useState<string | null>(null);
    const [ ready, setReady ] = useState(false);
    const [ box, setBox ] = useState({ width: 0, span: 0 });

    const uri = typeof source === "string" ? source : source?.uri ?? null;
    const shown = uri && failed !== uri ? uri : null;

    const picked = useMemo(() => shown ? rungFor(source, box.width) : null, [ shown, source, box.width ]);

    const hint = useMemo(() => {

        if ( !shown || typeof source === "string" ) return null;

        const first = source?.rungs?.[0]?.uri ?? null;

        return first && first !== picked ? first : null;

    }, [ shown, source, picked ]);

    const measure = ( event: LayoutChangeEvent ) => {

        const frame = event.nativeEvent.layout;

        setBox({ width: Math.round(frame.width), span: Math.round(Math.min(frame.width, frame.height)) });

    };

    const disc = Math.max(theme.icon.lg, Math.min(theme.art.sm, Math.round(box.span * 0.42)));

    return (
        <View
            onLayout={measure}
            style={[ {
                aspectRatio: ratio === null ? undefined : ratio ?? theme.ratio.photo,
                overflow: "hidden",
                backgroundColor: backdrop,
                ...( curve === undefined ? {} : { borderRadius: theme.radius[curve] } ),
            }, style ]}
        >
            {picked ? (
                <Image
                    source={picked}
                    recyclingKey={picked}
                    placeholder={hint ? { uri: hint } : null}
                    placeholderContentFit="cover"
                    style={StyleSheet.absoluteFill}
                    contentFit="cover"
                    transition={theme.beat.base}
                    cachePolicy="memory-disk"
                    onLoadEnd={() => { setReady(true); onReady?.(); }}
                    onError={() => setFailed(uri) }
                />
            ) : null}

            {picked && !ready && !hint ? (
                <Animated.View
                    exiting={FadeOut.duration(theme.beat.quick)}
                    style={[ StyleSheet.absoluteFill, { backgroundColor: backdrop } ]}
                />
            ) : null}

            {picked ? null : (
                <View
                    style={[ StyleSheet.absoluteFill, {
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: backdrop,
                    } ]}
                >
                    <Art name={figures[icon] ?? "domain-browse"} size={disc} />
                </View>
            )}

            {picked && night ? (
                <View pointerEvents="none" style={[ StyleSheet.absoluteFill, { backgroundColor: theme.photo.dim } ]} />
            ) : null}

            {scrim ? (
                <View
                    pointerEvents="none"
                    style={{
                        position: "absolute",
                        insetInlineStart: 0,
                        insetInlineEnd: 0,
                        bottom: 0,
                        height: "62%",
                        experimental_backgroundImage: veil(theme.plane.stage, 0, 0.72),
                    }}
                />
            ) : null}

            {children}
        </View>
    );

}
