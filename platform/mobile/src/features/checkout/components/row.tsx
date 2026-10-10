import { StyleSheet } from "react-native-unistyles";
import { Badge } from "@/elements/badge";
import { Box } from "@/elements/box";
import { Button } from "@/elements/button";
import { Link } from "@/elements/link";
import { Text, type TextTint } from "@/elements/text";
import { isolateLtr } from "@/std/bidi";
import type { InkName } from "@/theme/roles";

type CheckoutRowProps = {
    label: string;
    body: string;
    ink?: InkName | undefined;
    tint?: TextTint | undefined;
    ltr?: boolean;
    action: string;
    kind?: "link" | "button";
    done?: boolean;
    onPress: () => void;
};

export function CheckoutRow ({ label, body, ink, tint, ltr = false, action, kind = "link", done = false, onPress }: CheckoutRowProps) {

    return (
        <Box style={styles.row} row align="start" gap="4">
            <Box gap="1" style={styles.copy}>
                <Text rank="label">{label}</Text>
                <Text rank="body" ink={ink} tint={tint}>{ltr ? isolateLtr(body) : body}</Text>
            </Box>

            {done ? (
                <Badge label={action} tint="success" />
            ) : kind === "button" ? (
                <Button label={action} kind="soft" tint="neutral" block={false} onPress={onPress} />
            ) : (
                <Link rank="label" label={action} onPress={onPress} />
            )}
        </Box>
    );

}

const styles = StyleSheet.create(( theme ) => ({

    row: {
        paddingVertical: theme.space["1"],
    },
    copy: {
        flex: 1,
    },

}));
