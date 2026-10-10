import { Icon, type IconName } from "@/elements/icon";
import { Press } from "@/elements/press";
import { Text } from "@/elements/text";
import type { ToneName } from "@/theme/roles";
import type { RankName } from "@/theme/text";
import { useTheme } from "@/theme/use-theme";

type LinkProps = {
    label: string;
    onPress?: (() => void) | undefined;
    tint?: ToneName | undefined;
    rank?: RankName | undefined;
    icon?: IconName | undefined;
    disabled?: boolean | undefined;
};

export function Link ({ label, onPress, tint = "brand", rank = "caption", icon, disabled = false }: LinkProps) {

    const theme = useTheme();
    const hue = theme.tone[tint];
    const line = Math.min(theme.text[rank].latin.height, theme.text[rank].arabic.height);
    const rise = Math.max(theme.hit.slop, Math.ceil(( theme.hit.min - line ) / 2));

    return (
        <Press
            accessibilityRole="link"
            accessibilityLabel={label}
            accessibilityState={{ disabled }}
            hitSlop={{ top: rise, bottom: rise, left: theme.hit.slop, right: theme.hit.slop }}
            onPress={disabled ? undefined : onPress}
            disabled={disabled}
            feel="dim"
            muted={disabled ? theme.state.numb : 1}
            style={{ flexDirection: "row", alignItems: "center", gap: theme.space["1"], alignSelf: "flex-start" }}
        >
            {icon ? <Icon name={icon} size={theme.icon.sm} color={hue.base} /> : null}

            <Text rank={rank} color={hue.base}>{label}</Text>

        </Press>
    );

}
