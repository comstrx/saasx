import { type ReactNode, useEffect, useRef, useState } from "react";
import { Keyboard, Modal, Pressable, View } from "react-native";
import { useKeyboardContext } from "react-native-keyboard-controller";
import Animated, { useAnimatedStyle } from "react-native-reanimated";
import { Button } from "@/elements/button";
import { Emblem, type EmblemName } from "@/elements/emblem";
import { useLabels } from "@/elements/labels";
import { eases, useEase, useGlide } from "@/elements/motion";
import { Surface } from "@/elements/surface";
import { Text } from "@/elements/text";
import type { ToneName } from "@/theme/roles";
import { useTheme } from "@/theme/use-theme";

type AlertProps = {
    open: boolean;
    title: string;
    body?: string | undefined;
    tone?: ToneName | undefined;
    emblem?: EmblemName | undefined;
    confirm?: string | undefined;
    cancel?: string | undefined;
    busy?: boolean | undefined;
    sticky?: boolean | undefined;
    onConfirm?: (() => void) | undefined;
    onClose: () => void;
    children?: ReactNode | undefined;
};

const marks: Record<ToneName, EmblemName> = {
    brand: "bulb",
    accent: "star",
    success: "tick",
    danger: "flash",
    warning: "flash",
    info: "bulb",
    neutral: "bulb",
};

export function Alert ({ open, title, body, tone = "brand", emblem, confirm, cancel, busy = false, sticky = false, onConfirm, onClose, children }: AlertProps) {

    const theme = useTheme();
    const labels = useLabels();
    const [ mounted, setMounted ] = useState(open);
    const showing = useRef(false);
    const [ shown, setShown ] = useState(false);
    const { reanimated: { height: lift } } = useKeyboardContext();
    const stacked = ( confirm?.length ?? 0 ) + ( cancel?.length ?? 0 ) > 26;

    useEffect(() => {

        if ( open ) {

            setMounted(true);

            if ( showing.current ) setShown(true);

            return;

        }

        Keyboard.dismiss();
        setShown(false);

        const linger = setTimeout(() => {

            showing.current = false;
            setMounted(false);

        }, theme.beat.quick + 60);

        return () => clearTimeout(linger);

    }, [ open, theme.beat.quick ]);

    const enter = () => {

        showing.current = true;

        if ( open ) setShown(true);

    };

    const rise = useGlide("enter", [ "opacity", "transform" ]);
    const sink = useEase([ "opacity", "transform" ]);
    const fade = useEase("opacity");
    const motion = shown ? rise : { ...sink, transitionTimingFunction: eases.exit };

    const veil = { opacity: shown ? 1 : 0, ...fade };

    const card = {
        opacity: shown ? 1 : 0,
        transform: [ { scale: shown ? 1 : 1 - theme.swell.hero }, { translateY: shown ? 0 : theme.travel.mid } ],
        ...motion,
    };

    const clearing = useAnimatedStyle(() => ({ paddingBottom: theme.space["6"] + Math.abs(lift.value) }));

    if ( !mounted ) return null;

    const deeds = (
        <View style={{ gap: theme.space["2"], flexDirection: stacked ? "column" : "row-reverse" }}>
            {confirm ? (
                <View style={{ flex: stacked ? undefined : 1 }}>
                    <Button label={confirm} tint={tone} loading={busy} onPress={onConfirm} />
                </View>
            ) : null}

            {cancel ? (
                <View style={{ flex: stacked ? undefined : 1 }}>
                    <Button label={cancel} kind="soft" tint="neutral" disabled={busy} onPress={onClose} />
                </View>
            ) : null}
        </View>
    );

    return (
        <Modal visible transparent animationType="none" statusBarTranslucent navigationBarTranslucent onShow={enter} onRequestClose={sticky ? undefined : onClose}>
            <Animated.View style={[ { flex: 1, alignItems: "center", justifyContent: "center", padding: theme.space["6"] }, clearing ]}>
                <Animated.View style={[ { position: "absolute", inset: 0, backgroundColor: theme.plane.scrim }, veil ]}>
                    {sticky ? null : <Pressable accessibilityRole="button" accessibilityLabel={labels.close} style={{ flex: 1 }} onPress={onClose} />}
                </Animated.View>

                <Animated.View
                    accessibilityViewIsModal
                    style={[ {
                        width: "100%",
                        maxWidth: theme.layout.dialog,
                        alignItems: "center",
                        gap: theme.space["4"],
                        paddingTop: theme.space["5"],
                        paddingHorizontal: theme.space["5"],
                        paddingBottom: theme.space["4"],
                        borderRadius: theme.radius.sheet,
                        backgroundColor: theme.plane.base,
                        ...theme.depth.raise,
                    }, card ]}
                >
                    <Emblem name={emblem ?? marks[tone]} size={theme.art.sm} />

                    <View style={{ alignSelf: "stretch", gap: theme.space["2"] }}>
                        <Text rank="heading" align="center" numberOfLines={2}>{title}</Text>
                        {body ? <Text rank="body" ink="soft" align="center">{body}</Text> : null}
                    </View>

                    <Surface value="base">
                        {children ? <View style={{ alignSelf: "stretch" }}>{children}</View> : null}

                        {confirm || cancel ? <View style={{ alignSelf: "stretch", paddingTop: theme.space["2"] }}>{deeds}</View> : null}
                    </Surface>
                </Animated.View>
            </Animated.View>
        </Modal>
    );

}
