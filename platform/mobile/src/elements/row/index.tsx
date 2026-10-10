import { createContext, type ReactNode, useContext, useState } from "react";
import { View } from "react-native";
import { Icon, type IconName } from "@/elements/icon";
import { Plate } from "@/elements/plate";
import { Press } from "@/elements/press";
import { Switch } from "@/elements/switch";
import { Text } from "@/elements/text";
import type { ToneName } from "@/theme/roles";
import type { RankName } from "@/theme/text";
import { useTheme } from "@/theme/use-theme";

export const Seam = createContext(false);

type RowProps = {
    title: string;
    note?: string | undefined;
    value?: string | undefined;
    valueRank?: RankName | undefined;
    icon?: IconName | undefined;
    figure?: ReactNode | undefined;
    tint?: ToneName | undefined;
    tone?: ToneName | undefined;
    plated?: boolean | undefined;
    onPress?: (() => void) | undefined;
    trailing?: ReactNode | undefined;
    toggle?: { on: boolean; onChange: ( next: boolean ) => void; disabled?: boolean | undefined } | undefined;
    strong?: boolean | undefined;
};

export function Row ({ title, note, value, valueRank, icon, figure, tint, tone, plated = false, onPress, trailing, toggle, strong = false }: RowProps) {

    const theme = useTheme();
    const seamed = useContext(Seam);
    const row = theme.composition.row;
    const [ figured, setFigured ] = useState(0);
    const danger = tint === "danger";
    const words = danger ? theme.tone.danger.onSoft : theme.ink.strong;
    const glyph = tint ? theme.tone[tint].onSoft : theme.ink.glyph;

    const lead = icon && plated ? row.plate + row.plateGap
        : icon ? row.glyph + row.lead
            : figure ? figured + row.lead
                : 0;

    return (
        <Press
            accessibilityRole={onPress ? "button" : "none"}
            accessibilityLabel={title}
            accessibilityHint={note}
            onPress={onPress}
            disabled={!onPress}
            feel="ripple"
            muted={1}
        >
            <View
                style={{
                    flexDirection: "row",
                    alignItems: "center",
                    minHeight: row.line,
                    paddingHorizontal: row.pad,
                    paddingVertical: !note ? row.padY : toggle ? row.padYCheck : row.padYTwo,
                }}
            >
                {seamed && !plated ? (
                    <View
                        pointerEvents="none"
                        style={{ position: "absolute", top: 0, insetInlineStart: row.pad + lead, insetInlineEnd: 0, height: theme.stroke.hair, backgroundColor: theme.line.hair }}
                    />
                ) : null}

                {figure ? (
                    <View onLayout={( event ) => setFigured(Math.round(event.nativeEvent.layout.width))} style={{ marginEnd: row.lead }}>
                        {figure}
                    </View>
                ) : null}
                {icon && plated ? <View style={{ marginEnd: row.plateGap }}><Plate icon={icon} size={row.plate} tone={tone ?? tint ?? "brand"} look="square" /></View> : null}
                {icon && !plated ? <View style={{ marginEnd: row.lead }}><Icon name={icon} size={row.glyph} color={glyph} /></View> : null}

                <View style={{ flex: 1 }}>
                    <Text rank={strong ? "title" : "body"} color={words}>{title}</Text>
                    {note ? <Text rank="caption" ink="soft" numberOfLines={3}>{note}</Text> : null}
                </View>

                {value ? (
                    <Text
                        rank={valueRank ?? ( strong ? "price" : "body" )}
                        color={strong ? theme.ink.strong : onPress ? theme.tone.brand.onSoft : theme.ink.soft}
                        align="end"
                        style={{ flexShrink: 0, maxWidth: "60%", marginStart: theme.space["3"] }}
                    >
                        {value}
                    </Text>
                ) : null}

                {trailing ? <View style={{ marginStart: theme.space["3"] }}>{trailing}</View> : null}

                {toggle ? (
                    <View style={{ flexDirection: "row", alignItems: "center", gap: theme.space["3"], marginStart: theme.space["3"] }}>
                        {onPress ? <View style={{ width: theme.stroke.hair, height: row.split, backgroundColor: theme.line.hair }} /> : null}
                        <Switch on={toggle.on} disabled={toggle.disabled} label={title} onChange={toggle.onChange} />
                    </View>
                ) : null}
            </View>
        </Press>
    );

}
