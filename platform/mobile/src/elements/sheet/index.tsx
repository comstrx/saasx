import { type ReactNode, useEffect, useRef, useState } from "react";
import { Keyboard, Modal, Pressable, View } from "react-native";
import { Gesture, GestureDetector, GestureHandlerRootView } from "react-native-gesture-handler";
import { useKeyboardContext } from "react-native-keyboard-controller";
import Animated, { runOnJS, useAnimatedScrollHandler, useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { useUnistyles } from "react-native-unistyles";
import { Dock } from "@/elements/dock";
import { useLabels } from "@/elements/labels";
import { ModalHeader } from "@/elements/modal-header";
import { eases, useEase, useGlide } from "@/elements/motion";
import { Surface } from "@/elements/surface";
import { useTheme } from "@/theme/use-theme";

const Veil = Animated.createAnimatedComponent(Pressable);

type SheetProps = {
    open: boolean;
    onClose: () => void;
    title?: string | undefined;
    footer?: ReactNode | undefined;
    scroll?: boolean | undefined;
    fill?: boolean | undefined;
    tall?: boolean | undefined;
    head?: ReactNode | undefined;
    onNearEnd?: (() => void) | undefined;
    children: ReactNode;
};

export function Sheet ({ open, onClose, title, head, footer, scroll = false, fill = false, tall = false, onNearEnd, children }: SheetProps) {

    const theme = useTheme();
    const labels = useLabels();
    const { rt: { insets } } = useUnistyles();
    const [ mounted, setMounted ] = useState(open);
    const [ raised, setRaised ] = useState(false);
    const showing = useRef(false);
    const travel: number = theme.sheet.travel;
    const drag = useSharedValue(0);
    const atTop = useSharedValue(true);
    const held = useSharedValue(false);
    const near = useSharedValue(false);
    const lookahead = theme.space["10"] * 4;
    const { reanimated: { height: lift } } = useKeyboardContext();

    useEffect(() => {

        if ( open ) {

            setMounted(true);

            if ( showing.current ) setRaised(true);

            return;

        }

        Keyboard.dismiss();
        setRaised(false);

        const linger = setTimeout(() => {

            showing.current = false;
            drag.value = 0;
            setMounted(false);

        }, theme.beat.base + 60);

        return () => clearTimeout(linger);

    }, [ open, drag, theme.beat.base ]);

    const enter = () => {

        showing.current = true;

        if ( open ) setRaised(true);

    };

    const watch = useAnimatedScrollHandler(( event ) => {

        atTop.value = event.contentOffset.y <= 1;

        const close = event.contentOffset.y + event.layoutMeasurement.height >= event.contentSize.height - lookahead;

        if ( close && !near.value && onNearEnd ) runOnJS(onNearEnd)();

        near.value = close;

    });

    const rolling = Gesture.Native();

    const pull = Gesture.Pan()
        .activeOffsetY([ -theme.space["3"], theme.space["3"] ])
        .simultaneousWithExternalGesture(rolling)
        .onBegin(() => { held.value = atTop.value; })
        .onUpdate(( event ) => {

            if ( !held.value ) return;

            drag.value = Math.max(0, event.translationY);

        })
        .onEnd(( event ) => {

            if ( !held.value ) return;

            if ( event.translationY > theme.sheet.dismiss || event.velocityY > theme.sheet.fling ) {

                runOnJS(onClose)();

                return;

            }

            drag.value = withSpring(0, theme.spring.sheet);

        })
        .onFinalize(() => { held.value = false; });

    const rise = useGlide("sheet", "transform");
    const fall = useEase("transform", theme.beat.base);
    const glow = useEase("opacity", theme.beat.base);
    const following = useAnimatedStyle(() => ({ transform: [ { translateY: drag.value } ] }));
    const dimming = useAnimatedStyle(() => ({ opacity: 1 - Math.min(1, drag.value / travel) }));
    const clearing = useAnimatedStyle(() => ({ paddingBottom: Math.max(0, Math.abs(lift.value) - insets.bottom) }));

    if ( !mounted ) return null;

    const body = {
        ...( fill ? { flexGrow: 1 } : {} ),
        gap: theme.space["4"],
        paddingTop: tall ? 0 : theme.space["3"],
        paddingHorizontal: theme.layout.gutter,
        paddingBottom: footer ? theme.space["5"] : insets.bottom + theme.space["5"],
    };

    return (
        <Modal visible transparent animationType="none" statusBarTranslucent navigationBarTranslucent onShow={enter} onRequestClose={onClose}>
            <GestureHandlerRootView style={{ flex: 1, justifyContent: "flex-end" }}>
                <Veil
                    accessibilityRole="button"
                    accessibilityLabel={labels.close}
                    onPress={onClose}
                    style={{ position: "absolute", inset: 0, opacity: raised ? 1 : 0, ...glow }}
                >
                    <Animated.View pointerEvents="none" style={[ { position: "absolute", inset: 0, backgroundColor: theme.plane.scrim }, dimming ]} />
                </Veil>

                <Surface value="base">
                    <GestureDetector gesture={pull}>
                        <Animated.View
                            style={{
                                ...( tall ? { height: "100%" } : { maxHeight: `${ theme.sheet.reach * 100 }%` } ),
                                transform: [ { translateY: raised ? 0 : travel } ],
                                ...( raised ? rise : { ...fall, transitionTimingFunction: eases.exit } ),
                            }}
                        >
                            <Animated.View
                                style={[ {
                                    ...( tall ? { flex: 1 } : { flexShrink: 1 } ),
                                    overflow: "hidden",
                                    borderTopLeftRadius: tall ? 0 : theme.radius.sheet,
                                    paddingTop: tall ? insets.top : 0,
                                    borderTopRightRadius: tall ? 0 : theme.radius.sheet,
                                    backgroundColor: theme.plane.base,
                                }, following, clearing ]}
                            >
                                {tall ? null : <View style={{ height: theme.space["3"] }} />}

                                {title || tall ? <ModalHeader title={title} onBack={tall ? onClose : undefined} /> : null}

                                {head ? (
                                    <View style={{ paddingHorizontal: theme.layout.gutter, paddingBottom: theme.space["2"] }}>
                                        {head}
                                    </View>
                                ) : null}

                                {scroll ? (
                                    <GestureDetector gesture={rolling}>
                                        <Animated.ScrollView
                                            style={{ flexShrink: 1, ...( fill ? { flexGrow: 1 } : {} ) }}
                                            contentContainerStyle={body}
                                            keyboardShouldPersistTaps="handled"
                                            keyboardDismissMode="on-drag"
                                            showsVerticalScrollIndicator={false}
                                            scrollEventThrottle={16}
                                            onScroll={watch}
                                        >
                                            {children}
                                        </Animated.ScrollView>
                                    </GestureDetector>
                                ) : <View style={body}>{children}</View>}

                                {footer ? <Dock inline>{footer}</Dock> : null}
                            </Animated.View>
                        </Animated.View>
                    </GestureDetector>
                </Surface>
            </GestureHandlerRootView>
        </Modal>
    );

}
