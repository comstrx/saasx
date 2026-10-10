import { useTranslation } from "react-i18next";
import { StyleSheet } from "react-native-unistyles";
import { type GuestLine, Guests } from "@/components/guests";
import { Box } from "@/elements/box";
import { Button } from "@/elements/button";
import type { IconName } from "@/elements/icon";
import { Link } from "@/elements/link";
import { Sheet } from "@/elements/sheet";
import { Text } from "@/elements/text";
import type { CheckoutGuests } from "@/model/checkout";

type GuestKey = keyof CheckoutGuests;

type GuestSheetProps = {
    open: boolean;
    value: CheckoutGuests;
    capacity: number;
    valid: boolean;
    onChange: ( key: GuestKey, delta: number ) => void;
    onSave: () => void;
    onClose: () => void;
};

export function GuestSheet ({ open, value, capacity, valid, onChange, onSave, onClose }: GuestSheetProps) {

    const { t } = useTranslation();
    const maxPeople = capacity > 0 ? capacity : 16;

    const line = ( key: GuestKey, icon: IconName, min: number, max: number ): GuestLine<GuestKey> => ({
        key,
        icon,
        min,
        max,
        label: t(`checkout.guest.${ key }.title`),
        note: t(`checkout.guest.${ key }.body`),
    });

    const lines = [
        line("adults", "users", 1, Math.max(1, maxPeople - value.children)),
        line("children", "user", 0, Math.max(0, maxPeople - value.adults)),
        line("infants", "baby", 0, 5),
        line("pets", "pets", 0, 1),
    ];

    const footer = (
        <Box row align="center" justify="between" gap="4">
            <Box style={styles.wide}>
                <Button label={t("checkout.save")} disabled={!valid} onPress={onSave} />
            </Box>

            <Link label={t("common.cancel")} rank="label" onPress={onClose} />
        </Box>
    );

    return (
        <Sheet open={open} onClose={onClose} title={t("checkout.guests")} footer={footer} scroll>
            <Box gap="3" style={styles.intro}>
                <Text rank="body">{t("checkout.guestCapacity", { count: maxPeople })}</Text>
                <Text rank="caption" ink="soft">{t("checkout.guestSafety")}</Text>
            </Box>

            <Guests party={value} lines={lines} onChange={( key, next ) => onChange(key, next - value[key]) } />

            <Text rank="caption" ink="soft">{t("checkout.serviceAnimal")}</Text>
        </Sheet>
    );

}

const styles = StyleSheet.create(( theme ) => ({

    wide: {
        flex: 1,
        maxWidth: "72%",
    },
    intro: {
        paddingBottom: theme.space["3"],
    },

}));
