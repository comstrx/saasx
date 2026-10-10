import { useTranslation } from "react-i18next";
import { StyleSheet } from "react-native-unistyles";
import { type GuestLine, Guests } from "@/components/guests";
import { Box } from "@/elements/box";
import { Button } from "@/elements/button";
import { Link } from "@/elements/link";
import { Sheet } from "@/elements/sheet";
import type { SearchParty } from "@/model/search";

export type PartyKey = keyof SearchParty;

type SearchPartySheetProps = {
    open: boolean;
    value: SearchParty;
    onChange: ( key: PartyKey, next: number ) => void;
    onSave: () => void;
    onClose: () => void;
};

const most = 16;

export function usePartyLines ( value: SearchParty ): readonly GuestLine<PartyKey>[] {

    const { t } = useTranslation();

    return [
        { key: "adults", icon: "users", min: 1, max: most, label: t("checkout.guest.adults.title"), note: t("checkout.guest.adults.body") },
        { key: "children", icon: "user", min: 0, max: most, label: t("checkout.guest.children.title"), note: t("checkout.guest.children.body") },
        { key: "rooms", icon: "stay", min: 1, max: value.adults, label: t("search.roomsTitle"), note: t("search.roomsBody") },
    ];

}

export function SearchPartySheet ({ open, value, onChange, onSave, onClose }: SearchPartySheetProps) {

    const { t } = useTranslation();
    const lines = usePartyLines(value);

    const footer = (
        <Box row align="center" justify="between" gap="4">
            <Box style={styles.wide}>
                <Button label={t("checkout.save")} onPress={onSave} />
            </Box>

            <Link label={t("common.cancel")} rank="label" onPress={onClose} />
        </Box>
    );

    return (
        <Sheet open={open} onClose={onClose} title={t("search.party")} footer={footer} scroll>
            <Guests party={value} lines={lines} onChange={onChange} />
        </Sheet>
    );

}

const styles = StyleSheet.create({

    wide: {
        flex: 1,
        maxWidth: "72%",
    },

});
