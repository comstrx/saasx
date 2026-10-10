import { Fragment } from "react";
import { I18nManager, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { Counter } from "@/elements/counter";
import { Divider } from "@/elements/divider";
import { Emblem } from "@/elements/emblem";
import { Icon, type IconName } from "@/elements/icon";
import { Press } from "@/elements/press";
import { Round } from "@/elements/round";
import { Surface } from "@/elements/surface";
import { Text } from "@/elements/text";
import { symbolLeads } from "@/std/number";
import type { ToneName } from "@/theme/roles";
import { useTheme } from "@/theme/use-theme";

export type Deed = {
    key: string;
    label: string;
    icon: IconName;
    tone?: ToneName | undefined;
    onPress?: (() => void) | undefined;
};

export type Share = {
    key: string;
    label: string;
    value: string;
};

type WalletProps = {
    label: string;
    amount: number;
    symbol: string;
    digits?: number | undefined;
    shares?: readonly Share[] | undefined;
    hidden?: boolean | undefined;
    toggleLabel?: string | undefined;
    onToggle?: (() => void) | undefined;
};

export function Wallet ({ label, amount, symbol, digits = 2, shares = [], hidden = false, toggleLabel, onToggle }: WalletProps) {

    const theme = useTheme();
    const first = symbolLeads(symbol) && !I18nManager.isRTL;
    const glyph = <Text rank="price" ink="soft" ltr>{symbol}</Text>;

    return (
        <View style={styles.card}>
            <Surface value="base">
                <View style={styles.head}>
                    <View style={styles.top}>
                        <Text rank="label" ink="soft" style={styles.grow}>{label}</Text>
                        {onToggle ? <Round icon={hidden ? "eyeOff" : "eye"} onPress={onToggle} label={toggleLabel} /> : null}
                    </View>

                    <View style={styles.line}>
                        <View style={styles.amount}>
                            {first ? glyph : null}
                            {hidden ? <Text rank="figure" ltr>••••</Text> : <Counter value={amount} digits={digits} rank="figure" />}
                            {first ? null : glyph}
                        </View>

                        <Emblem name="wallet" size={theme.composition.wallet.art} />
                    </View>
                </View>

                {shares.length > 0 ? (
                    <>
                        <Divider />

                        <View style={styles.shares}>
                            {shares.map(( share, index ) => (
                                <Fragment key={share.key}>
                                    {index > 0 ? <Divider vertical inset="3" /> : null}

                                    <View style={styles.share} accessible accessibilityLabel={`${ share.label } ${ share.value }`}>
                                        <Text rank="caption" ink="soft" numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8}>{share.label}</Text>
                                        <Text rank="action" figures numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8}>{share.value}</Text>
                                    </View>
                                </Fragment>
                            ))}
                        </View>
                    </>
                ) : null}
            </Surface>
        </View>
    );

}

export function WalletDeeds ({ deeds }: { deeds: readonly Deed[] }) {

    const theme = useTheme();

    return (
        <View style={styles.deeds}>
            {deeds.map(( deed ) => (
                <Press
                    key={deed.key}
                    onPress={deed.onPress}
                    disabled={!deed.onPress}
                    style={styles.deed}
                    sink="tile"
                    accessibilityRole="button"
                    accessibilityLabel={deed.label}
                >
                    <View style={styles.tile}>
                        <Icon name={deed.icon} size={theme.icon.xl} color={theme.tone[deed.tone ?? "brand"].base} />
                    </View>

                    <Text rank="label" align="center" numberOfLines={1}>{deed.label}</Text>
                </Press>
            ))}
        </View>
    );

}

const styles = StyleSheet.create(( theme ) => ({

    card: {
        ...theme.card,
        borderRadius: theme.radius.panel,
        overflow: "hidden",
    },
    head: {
        padding: theme.space["5"],
        gap: theme.space["4"],
    },
    top: {
        flexDirection: "row",
        alignItems: "center",
        gap: theme.space["3"],
    },
    grow: {
        flex: 1,
    },
    line: {
        flexDirection: "row",
        alignItems: "center",
        gap: theme.space["4"],
    },
    amount: {
        flex: 1,
        minWidth: 0,
        flexDirection: "row",
        flexWrap: "wrap",
        alignItems: "baseline",
        gap: theme.space["2"],
    },
    shares: {
        flexDirection: "row",
        alignItems: "stretch",
    },
    share: {
        flex: 1,
        gap: theme.space["1"],
        paddingVertical: theme.space["4"],
        paddingHorizontal: theme.space["4"],
    },
    deeds: {
        flexDirection: "row",
        justifyContent: "space-around",
    },
    deed: {
        alignItems: "center",
        gap: theme.space["2"],
        minWidth: theme.composition.wallet.deed,
    },
    tile: {
        width: theme.composition.wallet.deed,
        height: theme.composition.wallet.deed,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: theme.radius.pill,
        backgroundColor: theme.plane.base,
    },

}));
