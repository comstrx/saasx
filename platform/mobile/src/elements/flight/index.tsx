import { Image } from "expo-image";
import { useEffect, useState } from "react";
import { I18nManager, StyleSheet, useWindowDimensions, View } from "react-native";
import Animated, { ReduceMotion, runOnJS, useAnimatedStyle, useSharedValue, withDelay, withSpring, withTiming } from "react-native-reanimated";
import { create } from "zustand";
import { useTheme } from "@/theme/use-theme";

export type Frame = { x: number; y: number; w: number; h: number; r: number };

export type Flight = { key: string; to: Frame };

type Trip = Flight & { uri: string; from: Frame };

type Tower = {
    trip: Trip | null;
    painted: string | null;
    launch: ( trip: Trip ) => void;
    paint: ( key: string ) => void;
    end: () => void;
};

export const useFlight = create<Tower>(( set ) => ({
    trip: null,
    painted: null,
    launch: ( trip ) => set({ trip, painted: null }),
    paint: ( key ) => set(( tower ) => tower.trip?.key === key ? { painted: key } : tower ),
    end: () => set({ trip: null, painted: null }),
}));

const patience = 1600;

export function FlightHost () {

    const theme = useTheme();
    const { width: span } = useWindowDimensions();
    const flip = I18nManager.isRTL;
    const trip = useFlight(( tower ) => tower.trip );
    const painted = useFlight(( tower ) => tower.painted );
    const end = useFlight(( tower ) => tower.end );

    const go = useSharedValue(0);
    const seen = useSharedValue(1);
    const [ landed, setLanded ] = useState<string | null>(null);
    const [ shown, setShown ] = useState<string | null>(null);

    useEffect(() => {

        if ( !trip ) return;

        go.value = 0;
        seen.value = 0;

        const bail = setTimeout(() => {

            seen.value = withTiming(0, { duration: theme.beat.quick }, ( done ) => { if ( done ) runOnJS(end)(); });

        }, patience);

        return () => clearTimeout(bail);

    }, [ trip, go, seen, end, theme.beat.quick ]);

    useEffect(() => {

        if ( !trip || shown !== trip.key ) return;

        const key = trip.key;

        seen.value = 1;
        go.value = withSpring(1, { ...theme.spring.glide, reduceMotion: ReduceMotion.System }, ( done ) => { if ( done ) runOnJS(setLanded)(key); });

    }, [ shown, trip, go, seen, theme.spring.glide ]);

    useEffect(() => {

        if ( trip ) return;

        setLanded(null);
        setShown(null);

    }, [ trip ]);

    useEffect(() => {

        if ( !trip || painted !== trip.key || landed !== trip.key ) return;

        seen.value = withDelay(theme.beat.instant, withTiming(0, { duration: theme.beat.base }, ( done ) => { if ( done ) runOnJS(end)(); }));

    }, [ painted, landed, trip, seen, end, theme.beat.instant, theme.beat.base ]);

    const from = trip?.from;
    const to = trip?.to;

    const skin = useAnimatedStyle(() => {

        if ( !from || !to ) return { opacity: 0 };

        const at = go.value;
        const mix = ( a: number, b: number ) => a + ( b - a ) * at;

        const w = mix(from.w, to.w);

        return {
            opacity: seen.value,
            left: flip ? span - mix(from.x, to.x) - w : mix(from.x, to.x),
            top: mix(from.y, to.y),
            width: w,
            height: mix(from.h, to.h),
            borderRadius: Math.max(0, mix(from.r, to.r)),
        };

    }, [ from, to, flip, span ]);

    if ( !trip ) return null;

    return (
        <View pointerEvents="none" style={StyleSheet.absoluteFill}>
            <Animated.View style={[ { position: "absolute", overflow: "hidden", backgroundColor: theme.plane.well }, skin ]}>
                <Image source={{ uri: trip.uri }} style={StyleSheet.absoluteFill} contentFit="cover" transition={0} cachePolicy="memory-disk" onDisplay={() => setShown(trip.key) } />
                <View style={[ StyleSheet.absoluteFill, { backgroundColor: theme.photo.dim } ]} />
            </Animated.View>
        </View>
    );

}
