import { View } from "react-native";
import { Button } from "@/elements/button";
import { Emblem } from "@/elements/emblem";
import { Icon } from "@/elements/icon";
import { Press } from "@/elements/press";
import { Text } from "@/elements/text";
import { useTheme } from "@/theme/use-theme";

type InviteCardProps = {
    code: string;
    title: string;
    body: string;
    codeLabel: string;
    shareLabel: string;
    onCopy: () => void;
    onShare: () => void;
};

export function InviteCard ({ code, title, body, codeLabel, shareLabel, onCopy, onShare }: InviteCardProps) {

    const theme = useTheme();

    return (
        <View style={{ ...theme.card, gap: theme.space["5"], padding: theme.space["5"] }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: theme.space["4"] }}>
                <Emblem name="gift" size={theme.control.lg.height} />

                <View style={{ flex: 1, gap: theme.space["1"] }}>
                    <Text rank="title">{title}</Text>
                    <Text rank="caption" ink="soft">{body}</Text>
                </View>
            </View>

            <Press
                accessibilityRole="button"
                accessibilityLabel={codeLabel}
                onPress={onCopy}
                sink="tile"
                style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: theme.space["3"],
                    paddingVertical: theme.space["3"],
                    paddingHorizontal: theme.space["4"],
                    borderRadius: theme.radius.control,
                    backgroundColor: theme.plane.well,
                }}
            >
                <View style={{ flex: 1, gap: theme.space["1"] }}>
                    <Text rank="note" ink="faint">{codeLabel}</Text>
                    <Text rank="title" numberOfLines={1} ltr>{code}</Text>
                </View>

                <Icon name="copy" size={theme.icon.md} tint="soft" />
            </Press>

            <Button label={shareLabel} icon="share" onPress={onShare} />
        </View>
    );

}
