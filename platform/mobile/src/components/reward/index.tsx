import { View } from "react-native";
import Animated, { css, useReducedMotion } from "react-native-reanimated";
import { Art, type Artwork } from "@/elements/art";
import { Burst } from "@/elements/burst";
import { Button } from "@/elements/button";
import { Confetti } from "@/elements/confetti";
import { Emblem, type EmblemName } from "@/elements/emblem";
import type { IconName } from "@/elements/icon";
import { Appear, glides } from "@/elements/motion";
import { Plate } from "@/elements/plate";
import { Sheet } from "@/elements/sheet";
import { Status } from "@/elements/status";
import { Text } from "@/elements/text";
import type { ToneName } from "@/theme/roles";
import { useTheme } from "@/theme/use-theme";
import { ramp } from "@/theme/wash";

export type RewardProps = {
    open: boolean;
    onClose: () => void;
    eyebrow: string;
    title: string;
    body: string;
    worth?: string | undefined;
    code?: string | undefined;
    action: string;
    figure?: Artwork | undefined;
    emblem?: EmblemName | undefined;
    tone?: ToneName | undefined;
    mark?: IconName | undefined;
    urgency?: { label: string; tint: ToneName } | undefined;
    onAction: () => void;
    celebrate?: boolean | undefined;
};

const landing = css.keyframes({
    from: { opacity: 0, transform: [ { scale: 0.72 }, { rotate: "-10deg" } ] },
    to: { opacity: 1, transform: [ { scale: 1 }, { rotate: "0deg" } ] },
});

export function Reward ({ open, onClose, eyebrow, title, body, worth, code, action, figure, emblem, tone = "accent", mark = "gift", urgency, celebrate = false, onAction }: RewardProps) {

    const theme = useTheme();
    const hue = theme.tone[tone];
    const still = useReducedMotion();

    const pop = still ? undefined : { animationName: landing, animationDuration: glides.bounce.duration, animationTimingFunction: glides.bounce.easing, animationDelay: theme.beat.quick, animationFillMode: "backwards" } as const;

    return (
        <Sheet
            open={open}
            onClose={onClose}
            footer={
                <View style={{ gap: theme.space["2"] }}>
                    <Button label={action} onPress={onAction} />
                </View>
            }
        >
            <View style={{ alignItems: "center", gap: theme.space["4"], paddingVertical: theme.space["2"] }}>
                <View style={{ alignItems: "center", justifyContent: "center", width: theme.composition.moment.stage, height: theme.composition.moment.stage }}>
                    <Burst on={open} size={theme.composition.moment.stage} tone={tone} />
                    {celebrate ? <Confetti on={open} reach={theme.composition.moment.stage} /> : null}

                    <View
                        style={{
                            alignItems: "center",
                            justifyContent: "center",
                            width: theme.composition.moment.halo,
                            height: theme.composition.moment.halo,
                            borderRadius: theme.radius.pill,
                            experimental_backgroundImage: ramp(hue.soft, theme.plane.base, 160),
                        }}
                    >
                        <Animated.View style={pop}>
                            {emblem || !figure ? <Emblem name={emblem ?? "gift"} size={theme.composition.moment.figure} /> : <Art name={figure} size={theme.composition.moment.figure} />}
                        </Animated.View>
                    </View>
                </View>

                <View style={{ alignSelf: "stretch", alignItems: "center", gap: theme.space["1"] }}>
                    <Appear from="below" delay={theme.beat.stagger * 2}>
                        <Text rank="note" tint={tone} align="center">{eyebrow}</Text>
                    </Appear>

                    <Appear from="below" delay={theme.beat.stagger * 4} style={{ alignSelf: "stretch" }}>
                        <Text rank="heading" align="center" numberOfLines={2}>{title}</Text>
                    </Appear>

                    <Appear from="below" delay={theme.beat.stagger * 6}>
                        <Text rank="caption" ink="soft" align="center">{body}</Text>
                    </Appear>
                </View>

                {worth ? (
                    <Appear from="below" delay={theme.beat.stagger * 8} grow>
                        <View
                            style={{
                                flexDirection: "row",
                                alignItems: "center",
                                gap: theme.space["2"],
                                paddingVertical: theme.space["2"],
                                paddingHorizontal: theme.space["4"],
                                borderRadius: theme.radius.pill,
                                backgroundColor: hue.soft,
                            }}
                        >
                            <Plate icon={mark} tone={tone} look="soft" size={theme.control.sm.height} />
                            <Text rank="title" tint={tone} ltr figures>{worth}</Text>
                        </View>
                    </Appear>
                ) : null}

                {code ? (
                    <Appear from="below" delay={theme.beat.stagger * 10}>
                        <Text rank="note" ink="soft" ltr figures>{code}</Text>
                    </Appear>
                ) : null}

                {urgency ? (
                    <Appear from="below" delay={theme.beat.stagger * 11}>
                        <Status label={urgency.label} tint={urgency.tint} size="sm" strong={urgency.tint === "danger"} />
                    </Appear>
                ) : null}
            </View>
        </Sheet>
    );

}
