import { View } from "react-native";
import Animated, { css, useReducedMotion } from "react-native-reanimated";
import { Button } from "@/elements/button";
import { Emblem, type EmblemName } from "@/elements/emblem";
import { Appear, glides } from "@/elements/motion";
import { Sheet } from "@/elements/sheet";
import { Text } from "@/elements/text";
import { travel } from "@/theme/motion";
import type { ToneName } from "@/theme/roles";
import { useTheme } from "@/theme/use-theme";
import { halo, ramp } from "@/theme/wash";

const landing = css.keyframes({
    from: { opacity: 0, transform: [ { translateY: travel.mid }, { scale: 0.68 } ] },
    to: { opacity: 1, transform: [ { translateY: 0 }, { scale: 1 } ] },
});

export type IntroProps = {
    open: boolean;
    onClose: () => void;
    emblem: EmblemName;
    title: string;
    line: string;
    dismiss: string;
    action?: string | undefined;
    tone?: ToneName | undefined;
    onAction?: (() => void) | undefined;
};

export function Intro ({ open, onClose, emblem, title, line, dismiss, action, tone = "brand", onAction }: IntroProps) {

    const theme = useTheme();
    const still = useReducedMotion();
    const hue = theme.tone[tone];
    const close = onClose;

    const take = () => {

        close();
        onAction?.();

    };

    const pop = still ? undefined : {
        animationName: landing,
        animationDuration: glides.bounce.duration,
        animationTimingFunction: glides.bounce.easing,
        animationDelay: theme.beat.base,
        animationFillMode: "backwards",
    } as const;

    return (
        <Sheet
            open={open}
            onClose={close}
            footer={
                <View style={{ gap: theme.space["2"] }}>
                    {action && onAction ? <Button label={action} onPress={take} /> : null}

                    <Button
                        label={dismiss}
                        kind={action && onAction ? "soft" : "solid"}
                        tint={action && onAction ? "neutral" : undefined}
                        onPress={close}
                    />
                </View>
            }
        >
            <View style={{ alignItems: "center", gap: theme.space["4"], paddingTop: theme.space["2"] }}>

                <View
                    pointerEvents="none"
                    style={{
                        width: theme.composition.moment.stage,
                        height: theme.composition.moment.stage,
                        alignItems: "center",
                        justifyContent: "center",
                        experimental_backgroundImage: halo(hue.base, theme.name === "dark" ? 0.22 : 0.16),
                    }}
                >
                    <View
                        style={{
                            width: theme.composition.moment.halo,
                            height: theme.composition.moment.halo,
                            alignItems: "center",
                            justifyContent: "center",
                            borderRadius: theme.radius.pill,
                            experimental_backgroundImage: ramp(hue.soft, theme.plane.base, 160),
                        }}
                    >
                        <Animated.View style={pop}>
                            <Emblem name={emblem} size={theme.composition.moment.halo} />
                        </Animated.View>
                    </View>
                </View>

                <View style={{ alignSelf: "stretch", alignItems: "center", gap: theme.space["2"] }}>
                    <Appear from="below" delay={theme.beat.stagger * 3} style={{ alignSelf: "stretch" }}>
                        <Text rank="heading" align="center" numberOfLines={2}>{title}</Text>
                    </Appear>

                    <Appear from="below" delay={theme.beat.stagger * 5} style={{ maxWidth: "92%" }}>
                        <Text rank="description" ink="soft" align="center">{line}</Text>
                    </Appear>
                </View>
            </View>
        </Sheet>
    );

}
