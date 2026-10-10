import type { RefObject } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { quickEmojis } from "@/components/emoji-board/emoji";
import { Icon } from "@/elements/icon";
import { Menu, type MenuItem } from "@/elements/menu";
import { Press } from "@/elements/press";
import { Text } from "@/elements/text";
import type { Message } from "@/model/chat";
import { useTheme } from "@/theme/use-theme";

type MessageMenuProps = {
    message: Message | null;
    anchor: RefObject<View | null>;
    onClose: () => void;
    onReaction: ( emoji: string | null ) => void;
    onMoreEmoji: () => void;
    onReply: () => void;
    onCopy: () => void;
    onStar: () => void;
    onEdit: () => void;
    onForward: () => void;
    onRemove: () => void;
};

export function MessageMenu ({ message, anchor, onClose, onReaction, onMoreEmoji, onReply, onCopy, onStar, onEdit, onForward, onRemove }: MessageMenuProps) {

    const { t } = useTranslation();
    const theme = useTheme();

    const items: readonly MenuItem[] = message ? [
        { key: "reply", label: t("chat.reply"), icon: "reply", onPress: onReply },
        ...( message.body ? [ { key: "copy", label: t("chat.copy"), icon: "copy" as const, onPress: onCopy } ] : [] ),
        { key: "star", label: message.starred ? t("chat.unstar") : t("chat.star"), icon: "star", onPress: onStar },
        ...( message.mine && message.body ? [ { key: "edit", label: t("chat.edit"), icon: "edit" as const, onPress: onEdit } ] : [] ),
        { key: "forward", label: t("chat.forward"), icon: "share", onPress: onForward },
        ...( message.mine ? [ { key: "delete", label: t("chat.delete"), icon: "trash" as const, danger: true, band: true, onPress: onRemove } ] : [] ),
    ] : [];

    const crown = (
        <View style={styles.crown}>
            {quickEmojis.map(( emoji ) => {

                const mine = message?.reactions.some(( reaction ) => reaction.emoji === emoji && reaction.mine );

                return (
                    <Press
                        key={emoji}
                        style={[ styles.emoji, mine && styles.emojiLive ]}
                        onPress={() => { onClose(); onReaction(mine ? null : emoji); }}
                        hitSlop={theme.hit.slop}
                        sink="disc"
                        accessibilityRole="button"
                        accessibilityLabel={emoji}
                    >
                        <Text rank="title">{emoji}</Text>
                    </Press>
                );

            })}

            <Press style={styles.emoji} onPress={() => { onClose(); onMoreEmoji(); }} hitSlop={theme.hit.slop} sink="disc" accessibilityRole="button" accessibilityLabel={t("chat.emoji")}>
                <Icon name="down" size={theme.icon.md} tint="soft" />
            </Press>
        </View>
    );

    return <Menu open={Boolean(message)} anchor={anchor} items={items} onClose={onClose} crown={crown} beside />;

}

const styles = StyleSheet.create(( theme ) => ({

    crown: {
        height: theme.composition.menu.crown,
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: theme.space["1"],
        borderRadius: theme.radius.pill,
        backgroundColor: theme.plane.raised,
        boxShadow: theme.cast.raise,
    },
    emoji: {
        width: theme.control.bar.height - theme.space["1"],
        height: theme.control.bar.height - theme.space["1"],
        alignItems: "center",
        justifyContent: "center",
        borderRadius: theme.radius.pill,
    },
    emojiLive: {
        backgroundColor: theme.tone.brand.soft,
    },

}));
