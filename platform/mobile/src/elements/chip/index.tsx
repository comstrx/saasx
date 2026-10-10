import type { ReactNode } from "react";
import Animated from "react-native-reanimated";
import { Icon, type IconName } from "@/elements/icon";
import { useTint } from "@/elements/motion";
import { Press } from "@/elements/press";
import { useSurface } from "@/elements/surface";
import { Text } from "@/elements/text";
import { above, type PlaneName, type ToneName } from "@/theme/roles";
import { useTheme } from "@/theme/use-theme";

type ChipProps = {
    label: string;
    onPress?: (() => void) | undefined;
    icon?: IconName | undefined;
    trailing?: IconName | undefined;
    figure?: ReactNode | undefined;
    count?: number | undefined;
    tint?: ToneName | undefined;
    on?: PlaneName | undefined;
    live?: boolean | undefined;
    block?: boolean | undefined;
    disabled?: boolean | undefined;
};

export function Chip ({ label, onPress, icon, trailing, figure, count, tint = "brand", on, live = false, block = false, disabled = false }: ChipProps) {

    const theme = useTheme();
    const hue = theme.tone[tint];
    const surface = useSurface();
    const seat = theme.plane[above(on ?? surface, theme.name === "dark")];
    const fade = useTint();

    const mark = live ? hue.onSoft : theme.ink.soft;

    return (
        <Press
            accessibilityRole="button"
            accessibilityLabel={label}
            accessibilityState={{ selected: live, disabled }}
            hitSlop={theme.hit.slop}
            onPress={disabled ? undefined : onPress}
            disabled={disabled}
            muted={disabled ? theme.state.numb : 1}
            sink="control"
            style={block ? { flex: 1 } : undefined}
        >
            <Animated.View
                key={theme.name}
                style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: theme.control.slim.gap,
                    minHeight: theme.control.slim.height,
                    paddingVertical: theme.space["1"],
                    paddingHorizontal: block ? theme.space["2"] : theme.control.md.pad,
                    borderRadius: theme.radius.pill,
                    backgroundColor: live ? hue.soft : seat,
                    ...fade,
                }}
            >
                {figure}
                {icon ? <Icon name={icon} size={theme.icon.md} color={mark} /> : null}

                <Text rank="action" color={live ? hue.onSoft : theme.ink.strong} {...( block ? { adjustsFontSizeToFit: true, minimumFontScale: 0.75 } : {} )}>{label}</Text>

                {count === undefined ? null : (
                    <Text rank="micro" color={hue.on} ltr figures align="center" style={{ minWidth: theme.tag.sm, paddingHorizontal: theme.space["1"], borderRadius: theme.radius.pill, backgroundColor: hue.base, overflow: "hidden" }}>{count}</Text>
                )}

                {live && !trailing ? <Icon name="check" size={theme.icon.md} color={mark} /> : null}
                {trailing ? <Icon name={trailing} size={theme.icon.md} color={mark} /> : null}
            </Animated.View>
        </Press>
    );

}
