import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { Badge } from "@/elements/badge";
import { Box } from "@/elements/box";
import { Icon } from "@/elements/icon";
import { Text } from "@/elements/text";
import { useMoney } from "@/features/shell/hooks/use-money";
import { type Perk, type Tier, valued } from "@/model/level";
import { useTheme } from "@/theme/use-theme";

type LadderProps = {
    tiers: readonly Tier[];
    rank: number;
};

export function Ladder ({ tiers, rank }: LadderProps) {

    const { t } = useTranslation();
    const theme = useTheme();
    const cash = useMoney();

    const worth = ( perk: Perk ): string => {

        if ( perk.rate > 0 ) return t("level.perkRate", { rate: perk.rate });
        if ( perk.value.amount > 0 ) return cash.amount(perk.value.amount, perk.value.currency);

        return t("level.perkOn");

    };

    return (
        <Box>
            {tiers.map(( tier, index ) => {

                const here = tier.rank === rank;
                const passed = tier.rank < rank;
                const tint = tier.color || theme.tone.brand.base;
                const perks = tier.perks.filter(valued);

                return (
                    <Box align="stretch" key={tier.id} row gap="4">
                        <Box align="center" style={styles.rail}>
                            <View style={[ styles.bead, styles.painted(tint, here || passed) ]}>
                                {passed
                                    ? <Icon name="check" size={theme.icon.xs} tint="lit" />
                                    : <Text rank="micro" ink={here ? undefined : "faint"} tint={here ? "on" : undefined} ltr>{tier.rank}</Text>}
                            </View>

                            {index < tiers.length - 1 ? <View style={styles.wire} /> : null}
                        </Box>

                        <Box gap="2" style={styles.copy}>
                            <Box row align="center" gap="2">
                                <Text rank="label" numberOfLines={1}>{tier.name}</Text>
                                {here ? <Badge label={t("level.tierCurrent")} tint="brand" /> : null}
                            </Box>

                            {tier.summary ? <Text rank="caption" ink="soft" numberOfLines={2}>{tier.summary}</Text> : null}

                            {perks.length > 0 ? (
                                <Box align="stretch" row wrap gap="2">
                                    {perks.map(( perk ) => (
                                        <Badge
                                            key={`${ tier.id }-${ perk.key }`}
                                            label={`${ t(`level.perk.${ perk.key }`, perk.key) } · ${ worth(perk) }`}
                                            tint={here ? "brand" : undefined}
                                        />
                                    ))}
                                </Box>
                            ) : null}
                        </Box>
                    </Box>
                );

            })}
        </Box>
    );

}

const styles = StyleSheet.create(( theme ) => ({

    rail: {
        width: theme.control.sm.height,
    },
    bead: {
        width: theme.control.sm.height,
        height: theme.control.sm.height,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: theme.radius.pill,
    },
    painted: ( tint: string, lit: boolean ) => ({
        backgroundColor: lit ? tint : theme.tone.neutral.soft,
    }),
    wire: {
        flex: 1,
        width: theme.stroke.base,
        minHeight: theme.space["5"],
        backgroundColor: theme.line.soft,
    },
    copy: {
        flex: 1,
        paddingBottom: theme.space["5"],
    },

}));
