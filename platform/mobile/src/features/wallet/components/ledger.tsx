import { router } from "expo-router";
import { useContext } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { Box } from "@/elements/box";
import { Icon, type IconName } from "@/elements/icon";
import { Press } from "@/elements/press";
import { Seam } from "@/elements/row";
import { Text } from "@/elements/text";
import { useMoney } from "@/features/shell/hooks/use-money";
import { type LedgerEntry, signed } from "@/model/wallet";
import { formatClock, formatDate } from "@/std/number";
import { useTheme } from "@/theme/use-theme";

type LedgerRowProps = {
    entry: LedgerEntry;
    clock?: boolean | undefined;
};

const glyphs: Record<string, IconName> = {
    credit: "deposit",
    deposit: "deposit",
    pay: "card",
    sale: "cart",
    refund: "refresh",
    release: "refresh",
    withdraw: "withdraw",
    transfer: "transfer",
    transfer_in: "transfer",
    transfer_out: "transfer",
    fee: "percent",
    cashback: "gift",
    reward: "gift",
    referral: "gift",
    points: "points",
    forfeit: "trash",
    suspend: "lock",
    hold: "lock",
};

export function LedgerRow ({ entry, clock = false }: LedgerRowProps) {

    const { t, i18n } = useTranslation();
    const theme = useTheme();
    const money = useMoney();
    const seamed = useContext(Seam);

    const tint = entry.inbound ? theme.tone.success.base : theme.ink.soft;
    const stamp = clock ? formatClock(i18n.language, entry.at) : formatDate(i18n.language, entry.at, "short");
    const reason = t(`wallet.reason.${ entry.reason }`, { defaultValue: t(`wallet.kind.${ entry.reason }`, { defaultValue: entry.reason }) });
    const pot = entry.pot ? t(`wallet.pot.${ entry.pot }`, { defaultValue: "" }) : "";
    const linked = entry.referenceType === "order" && entry.referenceId > 0;
    const worth = signed(t("wallet.pointsOnly", { count: Math.round(entry.amount) }), entry.inbound);

    const note = linked ? t("wallet.forOrder", { id: entry.referenceId }) : reason;
    const trail = [ linked ? reason : pot, stamp ].filter(Boolean).join(" · ");

    return (
        <Press
            style={styles.row}
            onPress={linked ? () => router.push(`/order/${ entry.referenceId }`) : undefined}
            disabled={!linked}
            feel="ripple"
            muted={1}
            accessibilityRole="button"
        >
            {seamed ? <View pointerEvents="none" style={styles.seam} /> : null}

            <Box align="center" justify="center" style={[ styles.plate, { backgroundColor: entry.inbound ? theme.tone.success.soft : theme.tone.neutral.soft } ]}>
                <Icon name={glyphs[entry.reason] ?? "receipt"} size={theme.icon.md} color={tint} />
            </Box>

            <Box gap="1" style={styles.copy}>
                <Text rank="label" numberOfLines={1}>{note}</Text>
                <Text rank="caption" ink="soft" numberOfLines={2}>{trail}</Text>
            </Box>

            <Text rank="title" tint={entry.inbound ? "success" : undefined} ltr figures>
                {entry.points ? worth : signed(money.amount(entry.amount, entry.currency), entry.inbound)}
            </Text>
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
        insetInlineStart: theme.composition.row.pad + theme.control.md.height + theme.space["4"],
        insetInlineEnd: 0,
        height: theme.stroke.hair,
        backgroundColor: theme.line.hair,
    },
    plate: {
        width: theme.control.md.height,
        height: theme.control.md.height,
        borderRadius: theme.radius.pill,
    },
    copy: {
        flex: 1,
    },

}));
