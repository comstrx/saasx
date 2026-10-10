import { Image } from "expo-image";
import { useTranslation } from "react-i18next";
import { ScrollView, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { Icon } from "@/elements/icon";
import { Press } from "@/elements/press";
import { Text } from "@/elements/text";
import { Input } from "@/elements/well";
import { attachmentKind, type ChatUpload, kindGlyph, type MessagePreview } from "@/model/chat";
import { timer } from "@/std/number";
import { useTheme } from "@/theme/use-theme";

const wave = [ 0.36, 0.72, 0.46, 0.94, 0.58, 0.82, 0.38, 0.7, 0.48, 0.9, 0.42, 0.64, 0.34, 0.78 ]
    .map(( height, slot ) => ({ id: `wave-${ slot }`, height }) );

type ChatComposerProps = {
    draft: string;
    files: readonly ChatUpload[];
    reply: MessagePreview | null;
    editing: MessagePreview | null;
    recording: boolean;
    recordingMillis: number;
    busy: boolean;
    onChange: ( value: string ) => void;
    onSend: () => void;
    onAttach: () => void;
    onEmoji: () => void;
    onRemoveFile: ( uri: string ) => void;
    onCancelReply: () => void;
    onCancelEdit: () => void;
    onStartRecording: () => void;
    onFinishRecording: () => void;
    onCancelRecording: () => void;
};

export function ChatComposer ( props: ChatComposerProps ) {

    const { t } = useTranslation();
    const theme = useTheme();
    const ready = Boolean(props.draft.trim() || props.files.length);

    const quote = props.editing
        ? { icon: "edit" as const, title: t("chat.editing"), body: props.editing.body, onClose: props.onCancelEdit }
        : props.reply
            ? { icon: "reply" as const, title: props.reply.mine ? t("chat.you") : props.reply.sender, body: props.reply.body || t("chat.attachment"), onClose: props.onCancelReply }
            : null;

    if ( props.recording ) {

        return (
            <View style={styles.dock}>
                <View style={[ styles.bar, styles.line ]}>
                    <Press onPress={props.onCancelRecording} hitSlop={theme.hit.slop} sink="disc" accessibilityRole="button" accessibilityLabel={t("common.cancel")} style={styles.key}>
                        <Icon name="trash" size={theme.icon.xl} color={theme.tone.danger.onSoft} />
                    </Press>

                    <View style={styles.record}>
                        <View style={styles.recordDot} />
                        <Text rank="label" color={theme.tone.danger.onSoft}>{timer(props.recordingMillis / 1000)}</Text>

                        <View style={styles.wave}>
                            {wave.map(( bar ) => <View key={bar.id} style={styles.waveBar(bar.height)} />)}
                        </View>
                    </View>

                    <Press onPress={props.onFinishRecording} sink="disc" accessibilityRole="button" accessibilityLabel={t("common.send")} style={styles.disc}>
                        <Icon name="send" size={theme.icon.lg} color={theme.material.lit} fill />
                    </Press>
                </View>
            </View>
        );

    }

    return (
        <View style={styles.dock}>
            {props.files.length ? (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.files}>
                    {props.files.map(( file ) => (
                        <Press
                            key={file.uri}
                            style={styles.file}
                            onPress={() => props.onRemoveFile(file.uri)}
                            hitSlop={theme.hit.slop}
                            sink="control"
                            accessibilityRole="button"
                            accessibilityLabel={t("chat.unattach", { name: file.name })}
                        >
                            {attachmentKind(file.mime) === "image"
                                ? <Image source={file.uri} style={styles.thumb} contentFit="cover" transition={140} />
                                : <Icon name={kindGlyph(attachmentKind(file.mime))} size={theme.icon.sm} color={theme.tone.brand.onSoft} />}

                            <Text rank="label" numberOfLines={1} style={styles.fileName}>{file.name}</Text>
                            <Icon name="close" size={theme.icon.xs} tint="soft" />
                        </Press>
                    ))}
                </ScrollView>
            ) : null}

            <View style={styles.bar}>
                {quote ? (
                    <View style={styles.quote}>
                        <Icon name={quote.icon} size={theme.icon.lg} color={theme.tone.brand.onSoft} />

                        <View style={styles.quoteCopy}>
                            <Text rank="label" color={theme.tone.brand.onSoft} numberOfLines={1}>{quote.title}</Text>
                            <Text rank="caption" ink="soft" numberOfLines={1}>{quote.body}</Text>
                        </View>

                        <Press onPress={quote.onClose} hitSlop={theme.hit.slop} sink="disc" accessibilityRole="button" accessibilityLabel={t("common.cancel")} style={styles.key}>
                            <Icon name="close" size={theme.icon.lg} tint="soft" />
                        </Press>
                    </View>
                ) : null}

                <View style={styles.line}>
                    <Press onPress={props.onEmoji} hitSlop={theme.hit.slop} sink="disc" accessibilityRole="button" accessibilityLabel={t("chat.emoji")} style={styles.key}>
                        <Icon name="smile" size={theme.icon.xl} tint="soft" />
                    </Press>

                    <Input
                        value={props.draft}
                        onChangeText={props.onChange}
                        placeholder={t("chat.placeholder")}
                        multiline
                        maxLength={5000}
                        returnKeyType="send"
                        blurOnSubmit={false}
                        style={styles.field}
                    />

                    <Press onPress={props.onAttach} hitSlop={theme.hit.slop} sink="disc" accessibilityRole="button" accessibilityLabel={t("chat.attach")} style={styles.key}>
                        <Icon name="attachment" size={theme.icon.xl} tint="soft" />
                    </Press>

                    <Press
                        onPress={ready ? props.onSend : props.onStartRecording}
                        disabled={props.busy}
                        sink="disc"
                        accessibilityRole="button"
                        accessibilityLabel={t(ready ? "common.send" : "chat.record")}
                        style={styles.disc}
                    >
                        <Icon name={ready ? "send" : "microphone"} size={theme.icon.lg} color={theme.material.lit} fill />
                    </Press>
                </View>
            </View>
        </View>
    );

}

const styles = StyleSheet.create(( theme, runtime ) => ({

    dock: {
        gap: theme.space["2"],
        paddingHorizontal: theme.layout.gutter,
        paddingTop: theme.space["1.5"],
        paddingBottom: runtime.insets.bottom + theme.composition.composer.floor,
    },
    bar: {
        overflow: "hidden",
        borderRadius: theme.composition.composer.bar / 2,
        backgroundColor: theme.chat.glass,
        boxShadow: theme.cast.float,
    },
    line: {
        flexDirection: "row",
        alignItems: "flex-end",
        minHeight: theme.composition.composer.bar,
    },
    key: {
        width: theme.composition.composer.key,
        height: theme.composition.composer.bar,
        alignItems: "center",
        justifyContent: "center",
    },
    field: {
        maxHeight: theme.composition.composer.field,
        paddingVertical: theme.space["2.5"],
    },
    disc: {
        width: theme.composition.composer.disc,
        height: theme.composition.composer.disc,
        margin: theme.composition.composer.inset,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: theme.radius.pill,
        backgroundColor: theme.tone.brand.bright,
    },
    quote: {
        flexDirection: "row",
        alignItems: "center",
        gap: theme.space["3"],
        paddingStart: theme.space["3"],
        paddingTop: theme.space["1"],
    },
    quoteCopy: {
        flex: 1,
        paddingStart: theme.space["2.5"],
        borderStartWidth: theme.stroke.base,
        borderStartColor: theme.tone.brand.onSoft,
    },
    files: {
        gap: theme.space["2"],
    },
    file: {
        maxWidth: theme.art.xl + theme.art.sm,
        height: theme.control.sm.height,
        flexDirection: "row",
        alignItems: "center",
        gap: theme.space["2"],
        paddingHorizontal: theme.space["3"],
        borderRadius: theme.radius.pill,
        backgroundColor: theme.chat.glass,
        boxShadow: theme.cast.float,
    },
    fileName: {
        maxWidth: theme.art.lg + theme.space["2"],
    },
    thumb: {
        width: theme.icon.lg,
        height: theme.icon.lg,
        borderRadius: theme.radius.tag,
    },
    record: {
        flex: 1,
        height: theme.composition.composer.bar,
        flexDirection: "row",
        alignItems: "center",
        gap: theme.space["2"],
    },
    recordDot: {
        width: theme.space["2"],
        height: theme.space["2"],
        borderRadius: theme.radius.pill,
        backgroundColor: theme.tone.danger.base,
    },
    wave: {
        flex: 1,
        height: theme.icon.md,
        flexDirection: "row",
        alignItems: "center",
        gap: 3,
    },
    waveBar: ( height: number ) => ({
        width: 3,
        height: Math.max(4, theme.icon.md * height),
        borderRadius: theme.radius.pill,
        backgroundColor: theme.tone.danger.bright,
    }),

}));
