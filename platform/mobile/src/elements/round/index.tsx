import { createContext, type ReactNode, useContext } from "react";
import { View } from "react-native";
import { Badge } from "@/elements/badge";
import { Icon, type IconName } from "@/elements/icon";
import { Press } from "@/elements/press";
import { useSurface } from "@/elements/surface";
import { above, type PlaneName, type ToneName } from "@/theme/roles";
import { useTheme } from "@/theme/use-theme";

type RoundLook = "solid" | "soft" | "paper" | "glass" | "plain";

export const RoundSpan = createContext<number | null>(null);

export const RoundGround = createContext<RoundLook | null>(null);

type RoundProps = {
    icon?: IconName | undefined;
    size?: number | undefined;
    iconSize?: number | undefined;
    children?: ReactNode | undefined;
    onPress?: (() => void) | undefined;
    look?: RoundLook | undefined;
    tone?: ToneName | undefined;
    on?: PlaneName | undefined;
    plane?: PlaneName | undefined;
    count?: number | undefined;
    mark?: ToneName | undefined;
    dot?: boolean | undefined;
    floats?: boolean | undefined;
    raised?: boolean | undefined;
    disabled?: boolean | undefined;
    label?: string | undefined;
};

export function Round ({ icon, size, iconSize, children, onPress, look: asked, tone, on, plane, count, mark = "danger", dot = false, floats = false, raised = false, disabled = false, label }: RoundProps) {

    const theme = useTheme();
    const surface = useSurface();
    const ground = useContext(RoundGround);
    const look = asked ?? ground ?? "paper";
    const hue = theme.tone[tone ?? "brand"];
    const inherited = useContext(RoundSpan) ?? theme.control.md.height;
    const span = size ?? inherited;
    const reach = theme.hit.slop + Math.max(0, ( theme.control.md.height - span ) / 2);

    const face = look === "plain" ? { backgroundColor: "transparent", borderColor: "transparent" }
        : look === "solid" ? { backgroundColor: hue.base, borderColor: hue.base }
            : look === "soft" ? { backgroundColor: hue.soft, borderColor: hue.soft }
                : look === "glass" ? { backgroundColor: theme.plane.veil, borderColor: theme.plane.veil, boxShadow: theme.cast.raise }
                    : { backgroundColor: theme.plane[plane ?? above(on ?? surface, theme.name === "dark")], borderColor: "transparent" };

    const paint = look === "solid" ? hue.on : look === "glass" ? tone ? hue.base : theme.material.ink : tone ? hue.onSoft : theme.ink.strong;
    const nudge = -theme.space["1"] * 1.5;

    return (
        <Press
            accessibilityRole="button"
            accessibilityLabel={label ?? icon ?? ""}
            accessibilityState={{ disabled }}
            hitSlop={reach}
            onPress={onPress}
            disabled={disabled || !onPress}
            muted={disabled ? theme.state.numb : 1}
            sink="disc"
        >
            <View
                style={{
                    width: span,
                    height: span,
                    borderRadius: span / 2,
                    borderWidth: theme.stroke.thin,
                    ...face,
                    ...( floats || ( raised && !disabled ) ? { boxShadow: theme.depth.float.boxShadow } : {} ),
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                {icon ? <Icon name={icon} size={iconSize ?? theme.icon.md} color={paint} /> : children}

                {!dot && !( count && count > 0 ) ? null : (
                    <View style={{ position: "absolute", top: nudge, insetInlineStart: nudge }}>
                        {dot ? <Badge dot tint={mark} /> : <Badge count={count} tint={mark} />}
                    </View>
                )}
            </View>
        </Press>
    );

}
