import { Image } from "expo-image";
import { useVideoPlayer, VideoView } from "expo-video";
import { useEffect, useRef, useState } from "react";
import { FlatList, Modal, useWindowDimensions, View } from "react-native";
import { Gesture, GestureDetector, GestureHandlerRootView } from "react-native-gesture-handler";
import Animated, { runOnJS, type SharedValue, useAnimatedStyle, useSharedValue, withSpring, withTiming } from "react-native-reanimated";
import { useUnistyles } from "react-native-unistyles";
import { useBars } from "@/elements/hooks/use-bars";
import { useLabels } from "@/elements/labels";
import { eases, useEase } from "@/elements/motion";
import { Round } from "@/elements/round";
import { leadOf } from "@/elements/scroll/lead";
import { Text } from "@/elements/text";
import { isolateLtr } from "@/std/bidi";
import { useTheme } from "@/theme/use-theme";

type ViewerItem = {
    id: string;
    url: string;
    video?: boolean | undefined;
};

type ViewerProps = {
    open: boolean;
    items: readonly ViewerItem[];
    start?: number | undefined;
    onClose: () => void;
};

const deepest = 4;
const close = 2.4;

function Shot ({ url, width, height, zoomed }: { url: string; width: number; height: number; zoomed: SharedValue<boolean> }) {

    const scale = useSharedValue(1);
    const shiftX = useSharedValue(0);
    const shiftY = useSharedValue(0);
    const base = useSharedValue(1);
    const fromX = useSharedValue(0);
    const fromY = useSharedValue(0);

    const settle = () => {

        scale.value = withTiming(1);
        shiftX.value = withTiming(0);
        shiftY.value = withTiming(0);
        zoomed.value = false;

    };

    const pinch = Gesture.Pinch()
        .onStart(() => { base.value = scale.value; })
        .onUpdate(( event ) => {

            scale.value = Math.min(deepest, Math.max(1, base.value * event.scale));
            zoomed.value = scale.value > 1;

        })
        .onEnd(() => { if ( scale.value <= 1.02 ) runOnJS(settle)(); });

    const drag = Gesture.Pan()
        .averageTouches(true)
        .manualActivation(true)
        .onTouchesMove(( _event, state ) => {

            if ( scale.value > 1 ) state.activate();
            else state.fail();

        })
        .onStart(() => {

            fromX.value = shiftX.value;
            fromY.value = shiftY.value;

        })
        .onUpdate(( event ) => {

            if ( scale.value <= 1 ) return;

            const room = ( scale.value - 1 ) / 2;

            shiftX.value = Math.min(width * room, Math.max(-width * room, fromX.value + event.translationX));
            shiftY.value = Math.min(height * room, Math.max(-height * room, fromY.value + event.translationY));

        });

    const twice = Gesture.Tap()
        .numberOfTaps(2)
        .onEnd(() => {

            if ( scale.value > 1 ) { runOnJS(settle)(); return; }

            scale.value = withTiming(close);
            zoomed.value = true;

        });

    const frame = useAnimatedStyle(() => ({
        transform: [ { translateX: shiftX.value }, { translateY: shiftY.value }, { scale: scale.value } ],
    }));

    return (
        <GestureDetector gesture={Gesture.Simultaneous(pinch, drag, twice)}>
            <Animated.View style={[ { width, height, alignItems: "center", justifyContent: "center" }, frame ]}>
                <Image source={url} style={{ width: "100%", height: "100%" }} contentFit="contain" />
            </Animated.View>
        </GestureDetector>
    );

}

function Clip ({ url, live, width, height }: { url: string; live: boolean; width: number; height: number }) {

    const player = useVideoPlayer(url, ( instance ) => { instance.loop = false; });

    useEffect(() => {

        if ( live ) player.play();
        else player.pause();

    }, [ live, player ]);

    return <VideoView player={player} style={{ width, height }} contentFit="contain" nativeControls />;

}

export function Viewer ({ open, items, start = 0, onClose }: ViewerProps) {

    const theme = useTheme();
    const labels = useLabels();
    const { rt: { insets } } = useUnistyles();
    const { width, height } = useWindowDimensions();
    const [ mounted, setMounted ] = useState(open);
    const showing = useRef(false);
    const [ seat, setSeat ] = useState(start);
    const drop = useSharedValue(0);
    const [ shown, setShown ] = useState(false);
    const zoomed = useSharedValue(false);
    const reach = theme.sheet.dismiss * 1.5;
    const ready = useBars(open, "light");

    useEffect(() => {

        if ( open ) {

            setMounted(true);
            setSeat(start);
            drop.value = 0;
            zoomed.value = false;

            if ( showing.current ) setShown(true);

            return;

        }

        setShown(false);

        const linger = setTimeout(() => {

            showing.current = false;
            setMounted(false);

        }, theme.beat.quick + 60);

        return () => clearTimeout(linger);

    }, [ open, start, drop, zoomed, theme.beat.quick ]);

    const enter = () => {

        showing.current = true;

        if ( open ) setShown(true);

    };

    const fade = useEase("opacity");
    const lights = { opacity: shown ? 1 : 0, ...fade, ...( shown ? {} : { transitionTimingFunction: eases.exit } ) };

    const stage = useAnimatedStyle(() => ({
        opacity: 1 - Math.min(1, Math.abs(drop.value) / ( reach * 3 )),
    }));

    const frame = useAnimatedStyle(() => ({ transform: [ { translateY: drop.value } ] }));

    const pull = Gesture.Pan()
        .activeOffsetY([ -theme.space["5"], theme.space["5"] ])
        .onUpdate(( event ) => {

            if ( !zoomed.value ) drop.value = event.translationY;

        })
        .onEnd(( event ) => {

            if ( zoomed.value ) return;

            if ( Math.abs(event.translationY) > reach ) {

                runOnJS(onClose)();

                return;

            }

            drop.value = withSpring(0, theme.spring.glide);

        });

    if ( !mounted || ( open && !ready ) ) return null;

    const tall = height - insets.top - insets.bottom - theme.control.lg.height * 2;

    return (
        <Modal visible transparent animationType="none" statusBarTranslucent navigationBarTranslucent onShow={enter} onRequestClose={onClose}>
            <GestureHandlerRootView style={{ flex: 1 }}>
                <Animated.View style={[ { flex: 1 }, lights ]}>
                    <Animated.View style={[ { flex: 1, backgroundColor: theme.plane.stage }, stage ]}>
                        <GestureDetector gesture={pull}>
                            <Animated.View style={[ { flex: 1, justifyContent: "center" }, frame ]}>
                                <FlatList
                                    data={items}
                                    keyExtractor={( item ) => item.id}
                                    horizontal
                                    pagingEnabled
                                    showsHorizontalScrollIndicator={false}
                                    initialScrollIndex={Math.min(start, Math.max(0, items.length - 1))}
                                    getItemLayout={( _data, index ) => ({ length: width, offset: width * index, index })}
                                    onMomentumScrollEnd={( event ) => setSeat(Math.round(leadOf(event.nativeEvent) / Math.max(1, width))) }
                                    renderItem={({ item, index }) => (
                                        <View style={{ width, height, alignItems: "center", justifyContent: "center" }}>
                                            {item.video
                                                ? <Clip url={item.url} live={open && index === seat} width={width} height={tall} />
                                                : <Shot url={item.url} width={width} height={tall} zoomed={zoomed} />}
                                        </View>
                                    )}
                                />
                            </Animated.View>
                        </GestureDetector>

                        <View style={{ position: "absolute", top: insets.top + theme.space["3"], insetInlineStart: theme.layout.gutter }}>
                            <Round icon="close" look="glass" onPress={onClose} label={labels.close} />
                        </View>

                        {items.length > 1 ? (
                            <View style={{ position: "absolute", bottom: insets.bottom + theme.space["6"], alignSelf: "center" }}>
                                <Text rank="caption" tint="on" ltr figures>{isolateLtr(`${ seat + 1 } / ${ items.length }`)}</Text>
                            </View>
                        ) : null}
                    </Animated.View>
                </Animated.View>
            </GestureHandlerRootView>
        </Modal>
    );

}
