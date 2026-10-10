import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { Badge } from "@/elements/badge";
import { Button } from "@/elements/button";
import { Emblem } from "@/elements/emblem";
import { Plate } from "@/elements/plate";
import { Surface } from "@/elements/surface";
import { Text } from "@/elements/text";
import { useMoney } from "@/features/shell/hooks/use-money";
import { type Coupon, usable, worth } from "@/model/coupon";
import { formatNumber } from "@/std/number";
import { useTheme } from "@/theme/use-theme";

type CouponCardProps = {
    coupon: Coupon;
    at: string;
    action: string;
    onPress: () => void;
};

export function CouponCard ({ coupon, at, action, onPress }: CouponCardProps) {

    const { t, i18n } = useTranslation();
    const money = useMoney();
    const theme = useTheme();

    const live = usable(coupon, Date.now());
    const count = ( value: number ) => formatNumber(i18n.language, value);
    const terms = coupon.mine ? "" : [
        coupon.points > 0 ? t("coupons.cost", { count: coupon.points, value: count(coupon.points) }) : "",
        coupon.minOrders > 0 ? t("coupons.needsOrders", { count: coupon.minOrders, value: count(coupon.minOrders) }) : "",
    ].filter(Boolean).join(" · ");
    const seat = live ? theme.tone.brand.soft : theme.plane.well;

    return (
        <View style={[ styles.card, !live && styles.numb ]}>
            <View style={[ styles.stub, styles.seated(seat) ]}>
                <Emblem name="gift" size={theme.control.bar.height} />
                <Text rank="title" tint={live ? "brand" : undefined} ink={live ? undefined : "faint"} ltr>{worth(coupon, money.round)}</Text>
                <Text rank="micro" ink="soft">{t("coupons.off")}</Text>
            </View>

            <View style={styles.seam} pointerEvents="none">
                <View style={[ styles.notch, styles.top ]} />
                <View style={styles.dash} />
                <View style={[ styles.notch, styles.bottom ]} />
            </View>

            <Surface value="base">
                <View style={styles.copy}>
                    <View style={styles.line}>
                        <Text rank="label" numberOfLines={1} style={styles.name}>{coupon.name}</Text>
                        {!live ? <Badge label={t("coupons.expired")} tint="danger" /> : null}
                    </View>

                    {coupon.note ? <Text rank="caption" ink="soft" numberOfLines={2}>{coupon.note}</Text> : null}

                    {terms ? <Text rank="caption" ink="soft">{terms}</Text> : null}

                    <View style={styles.code}>
                        <Plate icon="coupon" tone={live ? "brand" : "neutral"} size={theme.icon.xl} look={live ? "solid" : "soft"} />
                        <Text rank="label" ltr numberOfLines={1} style={styles.name}>{coupon.code}</Text>
                    </View>

                    <View style={styles.foot}>
                        <Text rank="micro" ink="faint" numberOfLines={1} style={styles.name}>{at}</Text>

                        <Button label={action} kind="soft" block={false} compact disabled={!live} onPress={onPress} />
                    </View>
                </View>
            </Surface>
        </View>
    );

}

const styles = StyleSheet.create(( theme ) => ({

    card: {
        ...theme.card,
        flexDirection: "row",
        overflow: "hidden",
        gap: theme.space["4"],
    },
    numb: {
        opacity: theme.state.numb,
    },
    stub: {
        gap: theme.space["1"],
        width: theme.control.lg.height + theme.space["6"],
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: theme.space["5"],
    },
    seated: ( seat: string ) => ({
        backgroundColor: seat,
    }),
    seam: {
        position: "absolute",
        top: 0,
        bottom: 0,
        insetInlineStart: theme.control.lg.height + theme.space["6"] - theme.space["2"],
        width: theme.space["4"],
        alignItems: "center",
    },
    notch: {
        position: "absolute",
        width: theme.space["4"],
        height: theme.space["4"],
        borderRadius: theme.radius.pill,
        backgroundColor: theme.plane.canvas,
    },
    top: {
        top: -theme.space["2"],
    },
    bottom: {
        bottom: -theme.space["2"],
    },
    dash: {
        flex: 1,
        width: theme.stroke.thin,
        marginVertical: theme.space["3"],
        borderInlineStartWidth: theme.stroke.base,
        borderStyle: "dashed",
        borderColor: theme.line.soft,
    },
    copy: {
        flex: 1,
        gap: theme.space["2"],
        paddingVertical: theme.space["4"],
        paddingInlineEnd: theme.space["4"],
    },
    line: {
        flexDirection: "row",
        alignItems: "center",
        gap: theme.space["3"],
    },
    name: {
        flex: 1,
    },
    code: {
        flexDirection: "row",
        alignItems: "center",
        gap: theme.space["2"],
    },
    foot: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: theme.space["3"],
        paddingTop: theme.space["1"],
    },

}));
