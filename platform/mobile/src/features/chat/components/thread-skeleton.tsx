import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { Box } from "@/elements/box";
import { Skeleton } from "@/elements/skeleton";
import { useTheme } from "@/theme/use-theme";

const thread: readonly { span: `${ number }%`; tall: boolean; mine: boolean }[] = [
    { span: "58%", tall: false, mine: false },
    { span: "44%", tall: false, mine: true },
    { span: "72%", tall: true, mine: false },
    { span: "36%", tall: false, mine: true },
    { span: "64%", tall: true, mine: false },
    { span: "50%", tall: false, mine: true },
];

export function ThreadSkeleton () {

    const theme = useTheme();
    const line = theme.text.body.latin.height;

    return (
        <Box gap="3" style={styles.thread}>
            {thread.map(( bubble, slot ) => (
                <View key={bubble.span + String(slot)} style={bubble.mine ? styles.mine : styles.theirs}>
                    <Skeleton curve="control" width={bubble.span} height={bubble.tall ? line * 2 + theme.space["5"] : line + theme.space["5"]} />
                </View>
            ))}
        </Box>
    );

}

const styles = StyleSheet.create(( theme ) => ({

    thread: {
        paddingHorizontal: theme.layout.gutter,
    },
    mine: {
        width: "100%",
        alignItems: "flex-end",
    },
    theirs: {
        width: "100%",
        alignItems: "flex-start",
    },

}));
