import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { Button } from "@/elements/button";
import { Field } from "@/elements/field";
import { Icon } from "@/elements/icon";
import { Press } from "@/elements/press";
import { Sheet } from "@/elements/sheet";
import { Text } from "@/elements/text";
import { useMoney } from "@/features/shell/hooks/use-money";
import { type Coupon, worth } from "@/model/coupon";
import { str } from "@/std/str";
import { useTheme } from "@/theme/use-theme";

type CouponSheetProps = {
    open: boolean;
    coupons: readonly Coupon[];
    value: string;
    busy?: boolean | undefined;
    error?: string | undefined;
    onApply: ( code: string ) => void;
    onClose: () => void;
};

export function CouponSheet ({ open, coupons, value, busy = false, error, onApply, onClose }: CouponSheetProps) {

    const { t } = useTranslation();
    const theme = useTheme();
    const money = useMoney();

    const [ draft, setDraft ] = useState(value);

    useEffect(() => {

        if ( open ) setDraft(value);

    }, [ open, value ]);

    const typed = draft.trim().toUpperCase();

    return (
        <Sheet
            open={open}
            onClose={onClose}
            title={t("checkout.couponTitle")}
            scroll
            footer={(
                <Button
                    label={t("checkout.couponApply")}
                    loading={busy}
                    disabled={typed.length === 0}
                    onPress={() => onApply(typed) }
                />
            )}
        >
            <Field
                icon="coupon"
                value={draft}
                onChangeText={setDraft}
                placeholder={t("checkout.couponHint")}
                autoCapitalize="characters"
                autoCorrect={false}
                accessibilityLabel={t("checkout.couponTitle")}
                error={error}
            />

            {coupons.length > 0 ? (
                <View style={styles.list}>
                    <Text rank="label">{t("checkout.couponAvailable")}</Text>

                    {coupons.map(( coupon ) => {

                        const picked = str.fold(coupon.code) === str.fold(typed);

                        return (
                            <Press
                                key={coupon.id}
                                style={[ styles.card, picked && styles.picked ]}
                                onPress={() => setDraft(coupon.code) }
                                sink="tile"
                                accessibilityRole="button"
                                accessibilityState={{ selected: picked }}
                            >
                                <View style={styles.worth}>
                                    <Text rank="label" tint="brand" ltr>{worth(coupon, money.round)}</Text>
                                </View>

                                <View style={styles.copy}>
                                    <Text rank="action" numberOfLines={1} ltr>{coupon.code}</Text>
                                    <Text rank="caption" ink="soft" numberOfLines={1}>{coupon.name}</Text>
                                </View>

                                {picked ? <Icon name="checkCircle" size={theme.icon.md} tint="brand" /> : null}
                            </Press>
                        );

                    })}
                </View>
            ) : null}
        </Sheet>
    );

}

const styles = StyleSheet.create(( theme ) => ({

    list: {
        gap: theme.space["3"],
    },
    card: {
        ...theme.depth.flat,
        borderRadius: theme.radius.tile,
        backgroundColor: theme.plane.base,
        flexDirection: "row",
        alignItems: "center",
        gap: theme.space["4"],
        padding: theme.space["3"],
    },
    picked: {
        backgroundColor: theme.tone.brand.soft,
    },
    worth: {
        minWidth: theme.control.lg.height,
        alignItems: "center",
    },
    copy: {
        flex: 1,
        gap: theme.space["1"] / 2,
    },

}));
