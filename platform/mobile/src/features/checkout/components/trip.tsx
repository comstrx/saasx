import { useTranslation } from "react-i18next";
import { StyleSheet } from "react-native-unistyles";
import { Box } from "@/elements/box";
import { Stepper } from "@/elements/stepper";
import { Text } from "@/elements/text";
import { CheckoutRow } from "@/features/checkout/components/row";
import { CheckoutSection } from "@/features/checkout/components/section";
import type { CheckoutGuests } from "@/model/checkout";

export type CheckoutTripVoice = "trip" | "cover" | "order";

type CheckoutCount = {
    value: number;
    min: number;
    max: number;
    note?: string | undefined;
    onChange: ( next: number ) => void;
};

type CheckoutTripProps = {
    dates: string;
    guests: CheckoutGuests;
    nights: number;
    dated: boolean;
    ranged?: boolean;
    guested: boolean;
    voice?: CheckoutTripVoice;
    count?: CheckoutCount | undefined;
    onDates: () => void;
    onGuests: () => void;
};

export function CheckoutTrip ({ dates, guests, nights, dated, ranged = true, guested, voice = "trip", count, onDates, onGuests }: CheckoutTripProps) {

    const { t } = useTranslation();

    const guestsValue = [
        t("checkout.guestsCount", { count: guests.adults + guests.children }),
        guests.infants > 0 ? t("checkout.guestsInfants", { count: guests.infants }) : "",
        guests.pets > 0 ? t("checkout.guestsPets", { count: guests.pets }) : "",
    ].filter(Boolean).join(" · ");

    return (
        <CheckoutSection title={t(voice === "cover" ? "checkout.yourCover" : voice === "order" ? "checkout.yourOrder" : "checkout.yourTrip")}>
            {dated ? (
                <CheckoutRow
                    label={t(voice === "cover" ? "checkout.coverDates" : ranged ? "checkout.dates" : "checkout.date")}
                    body={voice === "cover" || !ranged ? dates : t("checkout.datesValue", { dates, count: nights })}
                    action={t("common.change")}
                    onPress={onDates}
                />
            ) : null}

            {guested ? (
                <CheckoutRow
                    label={t("checkout.guests")}
                    body={guestsValue}
                    action={t("common.change")}
                    onPress={onGuests}
                />
            ) : null}

            {count ? (
                <Box style={styles.row} row align="center" gap="4">
                    <Box gap="1" style={styles.copy}>
                        <Text rank="label">{t("checkout.quantity")}</Text>
                        {count.note ? <Text rank="caption" ink="soft">{count.note}</Text> : null}
                    </Box>

                    <Stepper
                        value={count.value}
                        min={count.min}
                        max={count.max}
                        label={t("checkout.quantity")}
                        onChange={count.onChange}
                    />
                </Box>
            ) : null}
        </CheckoutSection>
    );

}

const styles = StyleSheet.create(( theme ) => ({

    row: {
        paddingVertical: theme.space["1"],
    },
    copy: {
        flex: 1,
    },

}));
