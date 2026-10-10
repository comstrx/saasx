import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { Round } from "@/elements/round";
import { Text } from "@/elements/text";
import { timer } from "@/std/number";

const bars = [ 0.32, 0.58, 0.4, 0.78, 0.5, 0.92, 0.62, 0.44, 0.84, 0.52, 0.7, 0.38, 0.64, 0.46, 0.8, 0.42, 0.57, 0.34, 0.72, 0.5, 0.88, 0.4, 0.66, 0.36, 0.6, 0.44 ]
    .map(( height, slot ) => ({ id: `wave-${ slot }`, height, at: slot / 26 }) );

export function ChatAudio ({ source, mine }: { source: string; mine: boolean }) {

    const { t } = useTranslation();
    const player = useAudioPlayer(source, { updateInterval: 120, downloadFirst: true });
    const status = useAudioPlayerStatus(player);

    const duration = Math.max(status.duration, 1);
    const progress = Math.min(1, status.currentTime / duration);

    const toggle = () => {

        if ( status.playing ) {

            player.pause();
            return;

        }

        if ( status.didJustFinish || status.currentTime >= duration - 0.1 ) void player.seekTo(0);

        player.play();

    };

    return (
        <View style={styles.audio}>
            <Round icon={status.playing ? "pause" : "play"} tone="brand" onPress={toggle} label={t(status.playing ? "chat.pause" : "chat.play")} />

            <View style={styles.track}>
                <View style={styles.wave}>
                    {bars.map(( bar ) => (
                        <View
                            key={bar.id}
                            style={[
                                styles.bar(bar.height),
                                mine ? styles.barMine : styles.barTheirs,
                                bar.at <= progress && ( mine ? styles.barMineActive : styles.barActive ),
                            ]}
                        />
                    ))}
                </View>

            </View>

            <Text rank="micro" ink="faint" style={styles.time}>
                {timer(status.duration || 0)}
            </Text>

            {status.isBuffering ? <View style={styles.buffer} /> : null}
        </View>
    );

}

const styles = StyleSheet.create(( theme ) => ({

    audio: {
        minWidth: theme.art.xl + theme.art.sm,
        flexDirection: "row",
        alignItems: "center",
        gap: theme.space["3"],
        marginTop: theme.space["1"],
        padding: theme.space["2"],
        borderRadius: theme.radius.control,
        backgroundColor: theme.plane[theme.name === "dark" ? "raised" : "canvas"],
    },
    track: {
        flex: 1,
    },
    wave: {
        height: theme.icon.lg,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    bar: ( height: number ) => ({
        width: 2.5,
        height: Math.max(5, theme.icon.lg * height),
        borderRadius: theme.radius.pill,
    }),
    barTheirs: {
        backgroundColor: theme.line.strong,
    },
    barMine: {
        backgroundColor: theme.tone.brand.line,
    },
    barActive: {
        backgroundColor: theme.tone.brand.base,
    },
    barMineActive: {
        backgroundColor: theme.tone.brand.base,
    },
    time: {
        opacity: theme.state.quiet,
    },
    buffer: {
        position: "absolute",
        top: 0,
        insetInlineEnd: 0,
        width: theme.space["2"],
        height: theme.space["2"],
        borderRadius: theme.radius.pill,
        backgroundColor: theme.tone.accent.base,
    },

}));
