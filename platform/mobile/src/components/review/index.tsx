import { StyleSheet } from "react-native-unistyles";
import { Avatar } from "@/elements/avatar";
import { Box } from "@/elements/box";
import { Rating } from "@/elements/rating";
import { Text } from "@/elements/text";
import { useTheme } from "@/theme/use-theme";

type ReviewProps = {
    name: string;
    body: string;
    score: number;
    when?: string | undefined;
    avatar?: string | null | undefined;
    look?: "row" | "card" | undefined;
    width?: number | undefined;
};

export function Review ({ name, body, score, when, avatar, look = "row", width }: ReviewProps) {

    const theme = useTheme();

    if ( look === "row" ) {

        return (
            <Box gap="3">
                <Box row align="center" gap="3">
                    <Avatar name={name} source={avatar} size={theme.control.md.height} />

                    <Box style={styles.grow} gap="0">
                        <Text rank="title" numberOfLines={1}>{name}</Text>
                        {when ? <Text rank="caption" ink="soft" figures>{when}</Text> : null}
                    </Box>
                </Box>

                <Rating score={score} size={theme.icon.xs} plain />
                <Text rank="body">{body}</Text>
            </Box>
        );

    }

    return (
        <Box style={[ styles.card, width === undefined ? undefined : { width } ]} gap="3">
            <Rating score={score} size={theme.icon.xs} plain />
            <Text rank="caption" numberOfLines={6} style={styles.grow}>{body}</Text>

            <Box row align="center" gap="3">
                <Avatar name={name} source={avatar} size={theme.control.sm.height} />

                <Box style={styles.grow} gap="0">
                    <Text rank="label" numberOfLines={1}>{name}</Text>
                    {when ? <Text rank="micro" ink="soft" figures>{when}</Text> : null}
                </Box>
            </Box>
        </Box>
    );

}

const styles = StyleSheet.create(( theme ) => ({

    card: {
        ...theme.card,
        padding: theme.space["4"],
    },
    grow: {
        flex: 1,
    },

}));
