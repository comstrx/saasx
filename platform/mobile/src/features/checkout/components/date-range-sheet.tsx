import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet } from "react-native-unistyles";
import { CalendarView, CalendarWeekdays } from "@/components/calendar";
import { Box } from "@/elements/box";
import { Button } from "@/elements/button";
import { Link } from "@/elements/link";
import { Sheet } from "@/elements/sheet";
import { Text } from "@/elements/text";
import { useMoney } from "@/features/shell/hooks/use-money";
import { type Availability, closedOn, emptyAvailability, priceOn } from "@/model/availability";
import { baseCurrency } from "@/model/currency";
import { addIsoDays, calendarMonths, type DateSpan, formatDateSpan, todayIso, validDateSpan, weekdayLabels } from "@/std/date-range";
import { formatDate, formatNumber } from "@/std/number";

type DateRangeSheetProps = {
    open: boolean;
    ahead?: number | undefined;
    value: DateSpan;
    valid: boolean;
    single?: boolean;
    availability?: Availability | undefined;
    currency?: string | undefined;
    onSelect: ( iso: string ) => void;
    onClear: () => void;
    onSave: () => void;
    onClose: () => void;
};

const styles = StyleSheet.create({

    wide: {
        flex: 1,
        maxWidth: "72%",
    },

});

export function DateRangeSheet ({ open, ahead = 730, value, valid, single = false, availability = emptyAvailability, currency = baseCurrency, onSelect, onClear, onSave, onClose }: DateRangeSheetProps) {

    const { t, i18n } = useTranslation();
    const minimum = addIsoDays(todayIso(), 1);
    const anchor = value.start && value.start >= minimum ? value.start : minimum;
    const ready = valid && validDateSpan(value, !single, minimum);
    const reach = Math.max(2, Math.ceil(ahead / 30));
    const [ shown, setShown ] = useState(3);

    useEffect(() => {

        if ( open ) setShown(3);

    }, [ open ]);

    const months = useMemo(
        () => calendarMonths(i18n.language, anchor, Math.min(shown, reach), minimum),
        [ anchor, i18n.language, minimum, reach, shown ],
    );

    const widen = useCallback(() => setShown(( current ) => Math.min(current + 3, reach) ), [ reach ]);
    const weekdays = useMemo(() => weekdayLabels(i18n.language), [ i18n.language ]);

    const cash = useMoney();

    const closed = useMemo(() => ( iso: string ) => closedOn(availability, iso), [ availability ]);

    const note = useMemo(() => ( iso: string ) => {

        const price = priceOn(availability, iso);

        return price && price.amount > 0 ? formatNumber(i18n.language, Math.round(price.amount)) : "";

    }, [ availability, i18n.language ]);

    const head = (
        <Box gap="3">
            <Box gap="1">
                <Text rank="title" align="center" numberOfLines={1}>
                    {( single
                        ? value.start ? formatDate(i18n.language, value.start, "medium") : ""
                        : formatDateSpan(i18n.language, value) ) || t(single ? "checkout.chooseDate" : "checkout.chooseDates")}
                </Text>
                {availability.known ? <Text rank="caption" ink="soft" align="center">{t("checkout.pricesIn", { currency: cash.symbol(availability.currency || currency) })}</Text> : null}
            </Box>
            <CalendarWeekdays weekdays={weekdays} />
        </Box>
    );

    const footer = (
        <Box row align="center" justify="between" gap="4">
            <Box style={styles.wide}>
                <Button label={t("checkout.save")} disabled={!ready} onPress={onSave} />
            </Box>

            <Link label={t("checkout.clear")} rank="label" onPress={onClear} />
        </Box>
    );

    return (
        <Sheet open={open} onClose={onClose} title={t(single ? "checkout.date" : "checkout.dates")} head={head} footer={footer} onNearEnd={widen} tall scroll>
            <CalendarView months={months} value={value} onSelect={onSelect} closed={closed} note={availability.known ? note : undefined} />
        </Sheet>
    );

}
