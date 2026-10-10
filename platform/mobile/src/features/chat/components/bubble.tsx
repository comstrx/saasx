import { Image } from "expo-image";
import { type RefObject, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Linking, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { Icon } from "@/elements/icon";
import { Media } from "@/elements/media";
import { Press } from "@/elements/press";
import { Text } from "@/elements/text";
import { ChatAudio } from "@/features/chat/components/audio";
import { type ChatAttachment, kindGlyph, type Message, viewable } from "@/model/chat";
import { isolateLtr } from "@/std/bidi";
import { useTheme } from "@/theme/use-theme";

const pictographic = ( code: number ): boolean =>
    ( code >= 0x1f000 && code <= 0x1faff )
    || ( code >= 0x2600 && code <= 0x27bf )
    || ( code >= 0x2b00 && code <= 0x2bff )
    || ( code >= 0x2190 && code <= 0x21ff )
    || ( code >= 0xfe00 && code <= 0xfe0f )
    || code === 0x200d
    || code === 0x20e3
    || code === 0x20;

const solo = ( message: Message ): boolean => {

    const body = message.body.trim();

    if ( !body || message.kind !== "text" || message.attachments.length > 0 || message.reply ) return false;

    const points = Array.from(body);

    return points.length <= 12 && points.every(( glyph ) => pictographic(glyph.codePointAt(0) ?? 0) );

};

type ChatBubbleProps = {
    message: Message;
    time: string;
    onLongPress: ( anchor: RefObject<View | null> ) => void;
    onReaction: ( emoji: string | null ) => void;
    onOpenMedia: ( item: ChatAttachment ) => void;
    onOpenOrder?: (( id: number ) => void) | undefined;
};

function Ticks ({ message }: { message: Message }) {

    const theme = useTheme();

    if ( message.failed ) return <Icon name="alert" size={theme.icon.xs} tint="danger" />;
    if ( message.pending ) return <Icon name="clock" size={theme.icon.xs} tint="faint" />;

    const tint = message.read ? "brand" : "faint";

    return (
        <View style={styles.ticks}>
            <Icon name="check" size={theme.icon.xs} tint={tint} />
            {message.delivered ? (
                <View style={styles.tick}>
                    <Icon name="check" size={theme.icon.xs} tint={tint} />
                </View>
            ) : null}
        </View>
    );

}

export function ChatBubble ({ message, time, onLongPress, onReaction, onOpenMedia, onOpenOrder }: ChatBubbleProps) {

    const { t } = useTranslation();
    const theme = useTheme();
    const spot = useRef<View>(null);

    const mine = message.mine;

    if ( message.kind === "system" ) {

        const order = message.order;
        const line = order ? t("chat.aboutOrder", { id: isolateLtr(`#${ order }`) }) : message.body;

        if ( order && onOpenOrder ) return (
            <Press style={styles.system} onPress={() => onOpenOrder(order)} hitSlop={theme.hit.slop} sink="control" accessibilityRole="link" accessibilityLabel={line}>
                <Text rank="caption" color={theme.material.lit} underline align="center">{line}</Text>
            </Press>
        );

        return (
            <View style={styles.system}>
                <Text rank="caption" color={theme.material.lit} align="center">{line}</Text>
            </View>
        );

    }

    const reactions = message.reactions.length ? (
        <View style={[ styles.reactions, mine ? styles.reactionsMine : styles.reactionsTheirs ]}>
            {message.reactions.map(( reaction ) => (
                <Press
                    key={reaction.emoji}
                    style={[ styles.reaction, reaction.mine && styles.reactionMine ]}
                    onPress={() => onReaction(reaction.mine ? null : reaction.emoji)}
                    hitSlop={theme.hit.slop}
                    sink="disc"
                    accessibilityRole="button"
                >
                    <Text rank="label">{reaction.emoji}</Text>
                    {reaction.count > 1 ? <Text rank="micro" ink="soft">{reaction.count}</Text> : null}
                </Press>
            ))}
        </View>
    ) : null;

    if ( solo(message) ) {

        return (
            <View style={[ styles.slot, mine ? styles.mineSlot : styles.theirSlot ]}>
                <View ref={spot} collapsable={false}>
                    <Press
                        style={[ styles.bubble, styles.bare, mine ? styles.mine : styles.theirs ]}
                        onLongPress={() => onLongPress(spot)}
                        delayLongPress={260}
                        sink="control"
                        accessibilityRole="button"
                    >
                        <Text rank="figure" align="center">{message.body.trim()}</Text>

                        <View style={styles.bareMeta}>
                            <Text rank="micro" ink="faint">{time}</Text>
                            {mine ? <Ticks message={message} /> : null}
                        </View>
                    </Press>
                </View>

                {reactions}
            </View>
        );

    }

    return (
        <View style={[ styles.slot, mine ? styles.mineSlot : styles.theirSlot ]}>
            <View ref={spot} collapsable={false} style={[ styles.line, mine && styles.lineMine ]}>
                <Press
                    style={[ styles.bubble, mine ? styles.mine : styles.theirs, message.failed && styles.failed ]}
                    onLongPress={() => onLongPress(spot)}
                    delayLongPress={260}
                    sink="tile"
                    accessibilityRole="button"
                >
                    {message.forwarded ? (
                        <View style={styles.forwarded}>
                            <Icon name="share" size={theme.icon.xs} tint="faint" />
                            <Text rank="micro" ink="faint">{t("chat.forwarded")}</Text>
                        </View>
                    ) : null}

                    {message.reply ? (
                        <View style={[ styles.reply, mine ? styles.replyMine : styles.replyTheirs ]}>
                            <Text rank="label" tint="brand" numberOfLines={1}>
                                {message.reply.mine ? t("chat.you") : message.reply.sender}
                            </Text>
                            <Text rank="caption" ink="soft" numberOfLines={2}>
                                {message.reply.body || t("chat.attachment")}
                            </Text>
                        </View>
                    ) : null}

                    {message.attachments.map(( item ) => {

                        if ( viewable(item) ) {

                            return (
                                <Press
                                    key={item.id}
                                    style={styles.image}
                                    onPress={() => onOpenMedia(item)}
                                    sink="tile"
                                    accessibilityRole="imagebutton"
                                    accessibilityLabel={item.name || t(`chat.kind.${ item.kind }`)}
                                >
                                    {item.kind === "video"
                                        ? <Media source={item.poster} icon="video" ratio={null} scrim={false} style={styles.shot} />
                                        : <Image source={item.url} style={styles.shot} contentFit="cover" transition={180} />}

                                    {item.kind === "video" ? (
                                        <View style={styles.play}>
                                            <Icon name="play" size={theme.icon.lg} tint="inverse" />
                                        </View>
                                    ) : null}
                                </Press>
                            );

                        }

                        if ( item.kind === "audio" ) return <ChatAudio key={item.id} source={item.url} mine={mine} />;

                        return (
                            <Press
                                key={item.id}
                                style={[ styles.file, mine && styles.fileMine ]}
                                onPress={() => void Linking.openURL(item.url)}
                                sink="tile"
                                accessibilityRole="link"
                                accessibilityLabel={item.name || t(`chat.kind.${ item.kind }`)}
                            >
                                <View style={[ styles.fileIcon, mine && styles.fileIconMine ]}>
                                    <Icon name={kindGlyph(item.kind)} size={theme.icon.lg} tint="brand" />
                                </View>

                                <View style={styles.fileCopy}>
                                    <Text rank="label" numberOfLines={1}>
                                        {item.name || t(`chat.kind.${ item.kind }`)}
                                    </Text>
                                    {item.size ? <Text rank="micro" ink="faint">{item.size}</Text> : null}
                                </View>

                                <Icon name="download" size={theme.icon.sm} tint="soft" />
                            </Press>
                        );

                    })}

                    {message.body ? <Text rank="body" style={styles.body}>{message.body}</Text> : null}

                    {!message.body && message.attachments.length === 0 ? (
                        <Text rank="body" ink="faint" style={styles.body}>
                            {t(`chat.kind.${ message.kind }`, { defaultValue: t("chat.attachment") })}
                        </Text>
                    ) : null}

                    <View style={styles.meta}>
                        {message.edited ? <Text rank="micro" ink="faint">{t("chat.edited")}</Text> : null}
                        {message.starred ? <Icon name="star" size={theme.icon.xs} tint="star" /> : null}

                        <Text rank="note" color={mine ? theme.chat.mineMeta : theme.ink.faint} style={styles.metaText}>{time}</Text>

                        {mine ? <Ticks message={message} /> : null}
                    </View>
                </Press>
            </View>

            {reactions}
        </View>
    );

}

const styles = StyleSheet.create(( theme ) => ({

    slot: {
        width: "100%",
        gap: theme.space["1"],
    },
    mineSlot: {
        alignItems: "flex-end",
    },
    theirSlot: {
        alignItems: "flex-start",
    },
    line: {
        maxWidth: "82%",
        flexDirection: "row",
        alignItems: "center",
        gap: theme.space["1"],
    },
    lineMine: {
        flexDirection: "row-reverse",
    },
    bubble: {
        flexShrink: 1,
        minWidth: theme.space["9"],
        gap: theme.space["1"] * 1.5,
        overflow: "hidden",
        paddingVertical: theme.space["2"] + theme.space["1"] / 2,
        paddingHorizontal: theme.space["3"] + theme.space["1"] / 2,
        borderRadius: theme.composition.bubble.radius,
    },
    body: {
        paddingVertical: theme.space["1"],
    },
    bare: {
        alignItems: "center",
    },
    bareMeta: {
        flexDirection: "row",
        alignItems: "center",
        gap: theme.space["1"],
    },
    ticks: {
        flexDirection: "row",
        alignItems: "center",
    },
    tick: {
        marginInlineStart: -theme.space["2"] + 1,
    },
    mine: {
        backgroundColor: theme.chat.mine,
    },
    theirs: {
        backgroundColor: theme.chat.theirs,
    },
    failed: {
        borderWidth: theme.stroke.base,
        borderColor: theme.tone.danger.base,
    },
    reply: {
        gap: 1,
        paddingVertical: theme.space["2"] + theme.space["1"] / 2,
        paddingHorizontal: theme.space["3"] + theme.space["1"] / 2,
        borderRadius: theme.radius.control,
        borderWidth: theme.stroke.thin,
        borderInlineStartWidth: theme.stroke.rail,
    },
    replyMine: {
        borderColor: "transparent",
        borderInlineStartColor: theme.tone.brand.base,
        backgroundColor: theme.tone.brand.soft,
    },
    replyTheirs: {
        borderColor: "transparent",
        borderInlineStartColor: theme.line.strong,
        backgroundColor: theme.plane[theme.name === "dark" ? "raised" : "well"],
    },
    image: {
        width: theme.art.xl + theme.art.sm,
        aspectRatio: theme.ratio.photo,
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        marginTop: theme.space["1"],
        borderRadius: theme.radius.tile,
        backgroundColor: theme.plane[theme.name === "dark" ? "raised" : "well"],
    },
    shot: {
        width: "100%",
        height: "100%",
    },
    play: {
        position: "absolute",
        width: theme.control.md.height,
        height: theme.control.md.height,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: theme.radius.pill,
        backgroundColor: theme.photo.chip,
    },
    file: {
        minWidth: theme.art.xl + theme.art.sm,
        flexDirection: "row",
        alignItems: "center",
        gap: theme.space["3"],
        padding: theme.space["2"],
        borderRadius: theme.radius.control,
        backgroundColor: theme.plane[theme.name === "dark" ? "raised" : "canvas"],
    },
    fileMine: {
        backgroundColor: theme.tone.brand.soft,
    },
    fileIcon: {
        width: theme.control.sm.height,
        height: theme.control.sm.height,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: theme.radius.pill,
        backgroundColor: theme.tone.brand.soft,
    },
    fileIconMine: {
        backgroundColor: theme.plane.base,
    },
    fileCopy: {
        flex: 1,
    },
    forwarded: {
        flexDirection: "row",
        alignItems: "center",
        gap: theme.space["1"],
        opacity: theme.state.quiet,
    },
    meta: {
        minHeight: theme.icon.xs,
        flexDirection: "row",
        alignItems: "center",
        alignSelf: "flex-end",
        gap: theme.space["1"],
    },
    metaText: {
        opacity: theme.state.quiet,
    },
    reactions: {
        flexDirection: "row",
        gap: theme.space["1"],
        marginTop: -theme.space["2"],
        zIndex: 2,
    },
    reactionsMine: {
        marginInlineEnd: theme.space["4"],
        marginTop: -theme.space["3"],
    },
    reactionsTheirs: {
        marginInlineStart: theme.space["4"],
        marginTop: -theme.space["3"],
    },
    reaction: {
        minWidth: theme.icon.lg + theme.space["2"],
        height: theme.icon.lg + theme.space["2"],
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 2,
        paddingHorizontal: theme.space["1"],
        borderRadius: theme.radius.pill,
        borderWidth: theme.stroke.thin,
        borderColor: theme.line.strong,
        backgroundColor: theme.plane.base,
    },
    reactionMine: {
        borderColor: theme.tone.brand.line,
    },
    system: {
        alignSelf: "center",
        maxWidth: "84%",
        paddingVertical: theme.space["1.5"],
        paddingHorizontal: theme.space["3"],
        borderRadius: theme.radius.pill,
        backgroundColor: theme.chat.stamp,
    },

}));
