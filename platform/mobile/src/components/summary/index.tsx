import { StyleSheet } from "react-native-unistyles";
import { Badge } from "@/elements/badge";
import { Box } from "@/elements/box";
import { Button } from "@/elements/button";
import { Dock } from "@/elements/dock";
import { Icon, type IconName } from "@/elements/icon";
import { Morph } from "@/elements/motion";
import { Price } from "@/elements/price";
import { Round } from "@/elements/round";
import { Text } from "@/elements/text";
import { useTheme } from "@/theme/use-theme";

type SummaryTint = "success" | "warning" | "danger";

type SummarySide = {
    icon: IconName;
    label: string;
    on: boolean;
    onPress: () => void;
};

type SummaryBarProps = {
    action: string;
    onAction: () => void;
    amount?: string | undefined;
    was?: string | undefined;
    lead?: string | undefined;
    unit?: string | undefined;
    caption?: string | undefined;
    flag?: string | undefined;
    note?: string | undefined;
    tint?: SummaryTint | undefined;
    busy?: boolean | undefined;
    disabled?: boolean | undefined;
    side?: SummarySide | undefined;
};

export function SummaryBar ({ action, onAction, amount, was, lead, unit, caption, flag, note, tint, busy = false, disabled = false, side }: SummaryBarProps) {

    const theme = useTheme();

    return (
        <Dock>
            <Box row align="center" gap={side ? "3" : "4"} style={styles.body}>
                <Box gap="1" style={styles.copy}>
                    {caption ? <Text rank="note" ink="soft" numberOfLines={1}>{caption}</Text> : null}

                    {amount ? (
                        <Box row align="baseline" gap="2" style={styles.price}>
                            {lead ? <Text rank="caption" ink="soft" numberOfLines={1}>{lead}</Text> : null}
                            <Morph watch={amount}><Price amount={amount} rank="price" /></Morph>
                            {flag ? <Badge label={flag} tint="danger" /> : null}
                        </Box>
                    ) : null}

                    {was || unit ? (
                        <Box row align="center" gap="2">
                            {was ? <Text rank="caption" ink="faint" ltr figures numberOfLines={1} style={styles.struck}>{was}</Text> : null}
                            {unit ? <Text rank="caption" ink="soft" numberOfLines={1}>{unit}</Text> : null}
                        </Box>
                    ) : null}

                    {note ? (
                        <Box row align="center" gap="1">
                            {tint ? <Icon name={tint === "success" ? "shield" : "info"} size={theme.icon.xs} tint={tint} /> : null}
                            <Text rank="note" ink="faint" tint={tint} numberOfLines={2}>{note}</Text>
                        </Box>
                    ) : null}
                </Box>

                {side ? (
                    <Box row align="center" gap="2" style={styles.paired}>
                        <Round icon={side.icon} look={side.on ? "soft" : undefined} onPress={side.onPress} label={side.label} />
                        <Button label={action} loading={busy} disabled={disabled} block={false} onPress={onAction} />
                    </Box>
                ) : (
                    <Box style={styles.action}>
                        <Button label={action} loading={busy} disabled={disabled} onPress={onAction} />
                    </Box>
                )}
            </Box>
        </Dock>
    );

}

const styles = StyleSheet.create(( theme ) => ({

    body: {
        minHeight: theme.control.md.height,
    },
    copy: {
        flex: 1,
        paddingInlineStart: theme.space["2"],
    },
    price: {
        flexWrap: "wrap",
        rowGap: theme.space["1"],
    },
    struck: {
        textDecorationLine: "line-through",
    },
    action: {
        flexShrink: 0,
        justifyContent: "flex-end",
        minWidth: "42%",
    },
    paired: {
        flexShrink: 0,
    },

}));
