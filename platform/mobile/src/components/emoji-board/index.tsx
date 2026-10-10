import { FlashList } from "@shopify/flash-list";
import { useMemo, useState } from "react";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { type Emoji, type EmojiGroup, emojiGroups, emojis } from "@/components/emoji-board/emoji";
import { Press } from "@/elements/press";
import { Search } from "@/elements/search";
import { Text } from "@/elements/text";
import { str } from "@/std/str";
import { useTheme } from "@/theme/use-theme";

type EmojiCopy = {
    search: string;
    none: string;
    group: ( key: EmojiGroup ) => string;
};

type EmojiBoardProps = {
    copy: EmojiCopy;
    onPick: ( emoji: string ) => void;
};

const columns = 6;

const everything: readonly Emoji[] = emojiGroups.flatMap(( group ) => emojis[group.key] );

export function EmojiBoard ({ copy, onPick }: EmojiBoardProps) {

    const theme = useTheme();
    const [ group, setGroup ] = useState<EmojiGroup>("smileys");
    const [ query, setQuery ] = useState("");

    const hunting = query.trim().length > 0;

    const items = useMemo(
        () => hunting
            ? everything.filter(( emoji ) => str.matches(emoji.tags, query) )
            : emojis[group],
        [ group, hunting, query ],
    );

    return (
        <View style={styles.board}>
            <Search
                value={query}
                onChangeText={setQuery}
                placeholder={copy.search}
                autoCorrect={false}
            />

            {hunting ? null : (
                <View style={styles.strip}>
                    {emojiGroups.map(( entry ) => {

                        const live = entry.key === group;

                        return (
                            <Press
                                key={entry.key}
                                style={[ styles.tab, live && styles.tabLive ]}
                                onPress={() => setGroup(entry.key)}
                                hitSlop={theme.hit.slop}
                                sink="disc"
                                accessibilityRole="tab"
                                accessibilityLabel={copy.group(entry.key)}
                                accessibilityState={{ selected: live }}
                            >
                                <Text rank="body">{entry.glyph}</Text>
                            </Press>
                        );

                    })}
                </View>
            )}

            <FlashList
                data={items}
                keyExtractor={( emoji ) => emoji.char}
                numColumns={columns}
                style={styles.grid}
                contentContainerStyle={styles.cells}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                ListEmptyComponent={
                    <View style={styles.blank}>
                        <Text rank="body" ink="soft" align="center">{copy.none}</Text>
                    </View>
                }
                renderItem={({ item }) => (
                    <View style={styles.slot}>
                        <Press
                            style={styles.cell}
                            onPress={() => onPick(item.char)}
                            sink="disc"
                            accessibilityRole="button"
                            accessibilityLabel={item.tags}
                        >
                            <Text rank="hero">{item.char}</Text>
                        </Press>
                    </View>
                )}
            />
        </View>
    );

}

const styles = StyleSheet.create(( theme ) => ({

    board: {
        height: theme.art.xl * 1.9,
        gap: theme.space["3"],
    },
    strip: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: theme.space["1"],
        borderRadius: theme.radius.pill,
        backgroundColor: theme.plane[theme.name === "dark" ? "raised" : "canvas"],
    },
    tab: {
        flex: 1,
        height: theme.control.sm.height - theme.space["2"],
        alignItems: "center",
        justifyContent: "center",
        borderRadius: theme.radius.pill,
    },
    tabLive: {
        backgroundColor: theme.plane.base,
    },
    grid: {
        flex: 1,
    },
    cells: {
        paddingBottom: theme.space["4"],
    },
    slot: {
        flex: 1,
        padding: theme.space["1"],
    },
    cell: {
        width: "100%",
        aspectRatio: 1,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: theme.radius.control,
    },
    blank: {
        paddingVertical: theme.space["9"],
    },

}));
