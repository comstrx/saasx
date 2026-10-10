import { useWindowDimensions } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { Box } from "@/elements/box";
import { Skeleton as Block } from "@/elements/skeleton";
import { useTheme } from "@/theme/use-theme";

export function Skeleton () {

    const theme = useTheme();
    const viewport = useWindowDimensions();

    return (
        <Box style={styles.stage} gap="6">
            <Block curve="tile" height={viewport.height * 0.43} />

            <Box style={styles.body} gap="4">
                <Block curve="tag" width="36%" height={theme.control.sm.height} />
                <Block curve="tag" width="82%" height={theme.space["7"]} />
                <Block curve="tag" width="58%" height={theme.space["4"]} />
                <Block curve="card" height={theme.control.lg.height + theme.space["5"]} />
                <Block curve="card" height={theme.art.md} />
            </Box>
        </Box>
    );

}

const styles = StyleSheet.create(( theme ) => ({

    stage: {
        flex: 1,
    },
    body: {
        paddingHorizontal: theme.layout.gutter,
    },

}));
