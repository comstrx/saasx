import { useTranslation } from "react-i18next";
import { StyleSheet } from "react-native-unistyles";
import { Strip } from "@/components/strip";
import { Box } from "@/elements/box";
import { Press } from "@/elements/press";
import { useSurface } from "@/elements/surface";
import { Text } from "@/elements/text";
import { useMoney } from "@/features/shell/hooks/use-money";
import { useWhen } from "@/features/shell/hooks/use-when";
import { type Availability, comingDays } from "@/model/availability";
import { marked, type Promotion } from "@/model/detail";
import { weekdayOf } from "@/std/date-range";
import { formatNumber } from "@/std/number";
import { above } from "@/theme/roles";
import { useTheme } from "@/theme/use-theme";

type ComingDaysProps = {
    availability: Availability;
    from: boolean;
    offer: Promotion | null;
    onPick: ( iso: string ) => void;
};

export function ComingDays ({ availability, from, offer, onPick }: ComingDaysProps) {

    const { t, i18n } = useTranslation();
    const money = useMoney();
    const when = useWhen();
    const theme = useTheme();
    const surface = useSurface();
    const seat = theme.plane[above(surface, theme.name === "dark")];

    const priceOf = ( amount: number ) => {

        const sale = marked({ amount, currency: availability.currency }, offer);
        const figure = formatNumber(i18n.language, Math.round(sale?.amount ?? amount));

        return from ? t("details.days.from", { price: figure }) : figure;

    };

    return (
        <Box gap="3">
            <Strip gap="3">
                {comingDays(availability).map(( day ) => {

                    const open = day.state === "open";

                    return (
                        <Press
                            key={day.iso}
                            onPress={() => onPick(day.iso)}
                            disabled={!open}
                            sink="tile"
                            accessibilityRole="button"
                            accessibilityState={{ disabled: !open }}
                            style={[ styles.day, open ? { backgroundColor: seat } : null ]}
                        >
                            <Text rank="note" ink="soft" numberOfLines={1}>{weekdayOf(i18n.language, day.iso)}</Text>
                            <Text rank="title" ink={open ? "base" : "faint"} figures>{when.day(day.iso)}</Text>
                            <Text rank="micro" ink={open ? "soft" : "faint"} numberOfLines={1} style={open ? null : styles.struck}>
                                {open
                                    ? day.price > 0 ? priceOf(day.price) : t("details.days.open")
                                    : t(`details.days.${ day.state }`)}
                            </Text>
                        </Press>
                    );

                })}
            </Strip>

            {availability.currency ? <Text rank="caption" ink="soft">{t("checkout.pricesIn", { currency: money.symbol(availability.currency) })}</Text> : null}
        </Box>
    );

}

const styles = StyleSheet.create(( theme ) => ({

    day: {
        alignItems: "center",
        gap: theme.space["1"],
        minWidth: theme.control.lg.height + theme.space["5"],
        paddingVertical: theme.space["3"],
        paddingHorizontal: theme.space["3"],
        borderRadius: theme.radius.tile,
    },
    struck: {
        textDecorationLine: "line-through",
    },

}));
