import { useContext } from "react";
import { View } from "react-native";
import { Icon, type IconName } from "@/elements/icon";
import { Plate } from "@/elements/plate";
import { Press } from "@/elements/press";
import { Seam } from "@/elements/row";
import { Text } from "@/elements/text";
import type { ToneName } from "@/theme/roles";
import { useTheme } from "@/theme/use-theme";

type DetailProps = {
    label: string;
    value: string;
    icon?: IconName | undefined;
    tone?: ToneName | undefined;
    hint?: string | undefined;
    verified?: boolean | undefined;
    pending?: { label: string; onPress: () => void } | undefined;
    onPress?: (() => void) | undefined;
};

export function Detail ({ label, value, icon, tone = "brand", hint, verified = false, pending, onPress }: DetailProps) {

    const theme = useTheme();
    const seamed = useContext(Seam);
    const row = theme.composition.row;
    const lead = icon ? row.plate + row.plateGap : 0;

    return (
        <Press feel="ripple" muted={1} onPress={onPress} disabled={!onPress} accessibilityRole="button" accessibilityLabel={label}>
            <View style={{ flexDirection: "row", alignItems: "center", minHeight: row.line, paddingHorizontal: row.pad, paddingVertical: row.padYTwo }}>
                {seamed ? (
                    <View
                        pointerEvents="none"
                        style={{ position: "absolute", top: 0, insetInlineStart: row.pad + lead, insetInlineEnd: 0, height: theme.stroke.hair, backgroundColor: theme.line.hair }}
                    />
                ) : null}

                {icon ? <View style={{ marginEnd: row.plateGap }}><Plate icon={icon} size={row.plate} tone={tone} look="square" /></View> : null}

                <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: theme.space["2"] }}>
                        <Text rank="body" ink={value ? "strong" : "faint"} numberOfLines={2} style={{ flexShrink: 1 }}>{value || hint}</Text>
                        {verified ? <Icon name="checkCircle" size={theme.icon.sm} tint="success" fill /> : null}
                    </View>

                    <Text rank="caption" ink="soft">{label}</Text>

                    {pending ? (
                        <Press onPress={pending.onPress} hitSlop={theme.hit.slop} feel="dim" accessibilityRole="button" style={{ alignSelf: "flex-start", paddingTop: theme.space["1"] }}>
                            <Text rank="label" color={theme.tone.brand.onSoft}>{pending.label}</Text>
                        </Press>
                    ) : null}
                </View>
            </View>
        </Press>
    );

}
