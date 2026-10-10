import { useContext } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { Badge } from "@/elements/badge";
import { Box } from "@/elements/box";
import { Icon, type IconName } from "@/elements/icon";
import { Press } from "@/elements/press";
import { Seam } from "@/elements/row";
import { Text } from "@/elements/text";
import { useMoney } from "@/features/shell/hooks/use-money";
import { credits, signed, type Transaction } from "@/model/wallet";
import { isolateLtr } from "@/std/bidi";
import { formatClock } from "@/std/number";
import type { ToneName } from "@/theme/roles";
import { useTheme } from "@/theme/use-theme";

type EntryProps = {
    entry: Transaction;
    onPress?: (() => void) | undefined;
};

const states: Record<Transaction["state"], ToneName> = {
    pending: "warning",
    successful: "success",
    failed: "danger",
    refunded: "brand",
    cancelled: "danger",
};

const glyphs: Record<Transaction["kind"], IconName> = {
    deposit: "deposit",
    withdraw: "withdraw",
    pay: "card",
    refund: "refresh",
    transfer: "transfer",
};

export function Entry ({ entry, onPress }: EntryProps) {

    const { t, i18n } = useTranslation();
    const theme = useTheme();
    const seamed = useContext(Seam);

    const inbound = credits(entry.kind);
    const dead = entry.state === "failed" || entry.state === "cancelled";
    const tint = dead ? theme.tone.danger.base : inbound ? theme.tone.success.base : theme.tone.brand.base;
    const money = useMoney();
    const amount = money.amount(entry.amount, entry.currency);
    const stamp = formatClock(i18n.language, entry.at) || entry.reference;
    const order = /^order:(\d+)$/.exec(entry.note)?.[1];
    const kind = t(`wallet.kind.${ entry.kind }`);
    const noted = order ? t("wallet.forOrder", { id: order }) : entry.note || kind;
    const meta = noted === kind ? stamp : `${ kind } · ${ stamp }`;

    return (
        <Press style={styles.row} onPress={onPress} disabled={!onPress} feel="ripple" muted={1} accessibilityRole="button">
            {seamed ? <View pointerEvents="none" style={styles.seam} /> : null}

            <Box align="center" justify="center" style={styles.plate}>
                <Icon name={glyphs[entry.kind]} size={theme.icon.md} color={tint} />
            </Box>

            <Box gap="1" style={styles.copy}>
                <Text rank="label" numberOfLines={1}>{noted}</Text>
                <Text rank="caption" ink="soft" numberOfLines={1}>{meta}</Text>
            </Box>

            <Box align="end" gap="1" style={styles.tail}>
                <Text rank="label" numberOfLines={1} ink={dead ? "faint" : undefined} tint={dead ? undefined : inbound ? "success" : undefined} strike={dead}>
                    {dead ? isolateLtr(amount) : signed(amount, inbound)}
                </Text>

                {entry.state === "successful" ? null : (
                    <Box row>
                        <Badge label={t(`wallet.state.${entry.state}`)} tint={states[entry.state]} />
                    </Box>
                )}
            </Box>
        </Press>
    );

}

const styles = StyleSheet.create(( theme ) => ({

    row: {
        flexDirection: "row",
        alignItems: "center",
        gap: theme.space["4"],
        minHeight: theme.control.lg.height + theme.space["2"],
        paddingVertical: theme.space["2"],
        paddingHorizontal: theme.composition.row.pad,
    },
    seam: {
        position: "absolute",
        top: 0,
        insetInlineStart: theme.composition.row.pad + theme.control.sm.height + theme.space["4"],
        insetInlineEnd: 0,
        height: theme.stroke.hair,
        backgroundColor: theme.line.hair,
    },
    plate: {
        width: theme.control.sm.height,
        height: theme.control.sm.height,
        borderRadius: theme.radius.pill,
        backgroundColor: theme.plane.well,
    },
    copy: {
        flex: 1,
    },
    tail: {
        minWidth: theme.art.sm,
    },

}));
