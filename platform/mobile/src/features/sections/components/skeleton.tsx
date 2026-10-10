import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { Box } from "@/elements/box";
import { Skeleton } from "@/elements/skeleton";
import { useTheme } from "@/theme/use-theme";

const groups = [ 0, 1, 2 ];

const cells = [ 0, 1, 2, 3 ];

export function SectionsSkeleton ({ span }: { span: number }) {

    const theme = useTheme();

    return (
        <Box gap="6">
            {groups.map(( group ) => (
                <Box key={group} gap="3">
                    <Box gap="1">
                        <Skeleton curve="tag" width="52%" height={theme.text.heading.latin.height} />
                        <Skeleton curve="tag" width="24%" height={theme.text.caption.latin.height} />
                    </Box>

                    <View style={styles.rail}>
                        {cells.slice(0, 3).map(( cell ) => (
                            <Box key={cell} gap="3" style={{ width: span }}>
                                <Skeleton curve="tile" height={Math.round(span / theme.ratio.wide)} />

                                <Box gap="2">
                                    <Skeleton curve="tag" width="72%" height={theme.text.title.latin.height} />
                                    <Skeleton curve="tag" width="40%" height={theme.text.caption.latin.height} />
                                </Box>
                            </Box>
                        ))}
                    </View>
                </Box>
            ))}
        </Box>
    );

}

export function SectionSkeleton ({ span }: { span: number }) {

    const theme = useTheme();

    return (
        <Box gap="4" style={styles.block}>
            <Skeleton curve="tag" width={theme.art.lg + theme.space["3"]} height={theme.text.title.latin.height} />

            <View style={styles.grid}>
                {cells.map(( cell ) => (
                    <Skeleton curve="card"
                        key={cell}
                        width={span}
                        height={span + theme.space["10"]}
                    />
                ))}
            </View>
        </Box>
    );

}

const styles = StyleSheet.create(( theme ) => ({

    rail: {
        flexDirection: "row",
        gap: theme.space["3"],
        overflow: "hidden",
    },
    block: {
        paddingHorizontal: theme.layout.gutter,
        paddingTop: theme.space["6"],
    },
    grid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: theme.space["3"],
    },

}));
