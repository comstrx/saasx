import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { Check } from "@/elements/check";
import { chevronNext, Icon, type IconName } from "@/elements/icon";
import { Media } from "@/elements/media";
import { Press } from "@/elements/press";
import { Round } from "@/elements/round";
import { Stepper } from "@/elements/stepper";
import { Surface } from "@/elements/surface";
import { Text } from "@/elements/text";
import type { Picture } from "@/std/picture";
import type { ToneName } from "@/theme/roles";
import { useTheme } from "@/theme/use-theme";

type BasketItemProps = {
    title: string;
    note?: string | undefined;
    image?: Picture | string | null | undefined;
    icon?: IconName | undefined;
    unit: string;
    amount?: string | undefined;
    was?: string | undefined;
    amountLabel: string;
    amountLead?: string | undefined;
    unpriced: string;
    status?: { label: string; tone: ToneName } | undefined;
    selection?: { checked: boolean; label: string; onChange: () => void } | undefined;
    detail?: { label: string; note: string; ready: boolean; icon?: IconName | undefined; onPress: () => void } | undefined;
    quantity: { value: number; min: number; max?: number | undefined; label: string; onChange: ( next: number ) => void };
    remove: { label: string; onPress: () => void };
    onOpen?: (() => void) | undefined;
    busy?: boolean | undefined;
};

export function BasketItem ({ title, note, image, icon, unit, amount, was, amountLabel, amountLead, unpriced, status, selection, detail, quantity, remove, onOpen, busy = false }: BasketItemProps) {

    const theme = useTheme();
    const kept = selection?.checked ?? true;

    return (
        <View style={styles.card}>
            <Surface value="base">
                <View style={styles.head}>
                    {selection ? (
                        <View style={styles.tick}>
                            <Check tick on={selection.checked} label={selection.label} onChange={selection.onChange} disabled={busy} />
                        </View>
                    ) : null}

                    <View style={[ styles.lead, { opacity: kept ? 1 : theme.state.numb } ]}>
                        <Press onPress={onOpen} disabled={!onOpen} feel="dim" accessibilityRole="button" accessibilityLabel={title}>
                            <Media source={image} icon={icon} ratio={1} curve="tile" scrim={false} style={styles.image} />
                        </Press>

                        <View style={styles.copy}>
                            <Text rank="title" numberOfLines={2}>{title}</Text>
                            {note ? <Text rank="caption" ink="soft" numberOfLines={1}>{note}</Text> : null}
                            <Text rank="caption" ink="soft" numberOfLines={2}>{unit}</Text>
                            {status ? <Text rank="micro" tint={status.tone}>{status.label}</Text> : null}
                        </View>
                    </View>

                    <Round icon="trash" look="plain" tone="danger" size={theme.control.sm.height} iconSize={theme.icon.md} label={remove.label} onPress={remove.onPress} disabled={busy} />
                </View>

                {detail ? (
                    <Press onPress={detail.onPress} disabled={busy} feel="ripple" accessibilityRole="button" style={styles.details}>
                        <Icon name={detail.ready ? detail.icon ?? "calendar" : "alert"} size={theme.icon.md} tint={detail.ready ? "soft" : "warning"} />
                        <View style={styles.copy}>
                            <Text rank="label" tint={detail.ready ? undefined : "warning"}>{detail.label}</Text>
                            {detail.note ? <Text rank="caption" ink="soft">{detail.note}</Text> : null}
                        </View>
                        <Icon name={chevronNext} size={theme.icon.sm} tint="faint" />
                    </Press>
                ) : null}

                <View style={[ styles.foot, { opacity: kept ? 1 : theme.state.numb } ]}>
                    <View style={styles.total}>
                        <Text rank="micro" ink="soft">{amountLabel}</Text>
                        {amount ? (
                            <View style={styles.sum}>
                                {amountLead ? <Text rank="micro" ink="soft">{amountLead}</Text> : null}
                                <Text rank="title" ltr figures>{amount}</Text>
                            </View>
                        ) : <Text rank="caption" tint="warning">{unpriced}</Text>}
                        {amount && was ? <Text rank="caption" ink="faint" strike ltr figures>{was}</Text> : null}
                    </View>

                    <Stepper {...quantity} disabled={busy} />
                </View>
            </Surface>
        </View>
    );

}

const styles = StyleSheet.create(( theme ) => ({

    card: {
        marginHorizontal: theme.layout.gutter,
        gap: theme.space["3"],
        padding: theme.space["3"],
        borderRadius: theme.radius.card,
        backgroundColor: theme.plane.base,
    },
    head: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: theme.space["3"],
    },
    tick: {
        height: theme.composition.commerce.thumbnail,
        justifyContent: "center",
    },
    lead: {
        flex: 1,
        flexDirection: "row",
        alignItems: "flex-start",
        gap: theme.space["3"],
    },
    image: {
        width: theme.composition.commerce.thumbnail,
        height: theme.composition.commerce.thumbnail,
    },
    copy: {
        flex: 1,
        gap: theme.space["1"],
    },
    details: {
        flexDirection: "row",
        alignItems: "center",
        gap: theme.space["3"],
        minHeight: theme.hit.min,
        padding: theme.space["3"],
        overflow: "hidden",
        backgroundColor: theme.plane.well,
        borderRadius: theme.radius.control,
    },
    foot: {
        flexDirection: "row",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "space-between",
        gap: theme.space["3"],
    },
    total: {
        flexShrink: 1,
        gap: theme.space["1"],
    },
    sum: {
        flexDirection: "row",
        flexWrap: "wrap",
        alignItems: "baseline",
        gap: theme.space["1"],
    },

}));
