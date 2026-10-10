import type { TFunction } from "i18next";
import { StyleSheet } from "react-native-unistyles";
import { Box } from "@/elements/box";
import type { IconName } from "@/elements/icon";
import { Plate } from "@/elements/plate";
import { Text } from "@/elements/text";
import type { When } from "@/features/shell/hooks/use-when";
import { can, type Detail, type DetailShape, shapeOf } from "@/model/detail";
import { formatNumber } from "@/std/number";
import { useTheme } from "@/theme/use-theme";

type Spec = {
    key: string;
    icon: IconName;
    label: string;
    value: string;
};

const covered: Record<DetailShape, readonly string[]> = {
    stay: [],
    goods: [ "stock", "delivery", "digital" ],
    document: [ "duration", "starts", "ends" ],
    stage: [ "starts", "ends" ],
    route: [ "starts", "ends", "duration" ],
    outing: [ "duration" ],
    session: [ "digital", "starts", "duration" ],
};

export const specsOf = ( detail: Detail, t: TFunction, when: When, locale: string ): readonly Spec[] => {

    const rows: Spec[] = [];

    if ( can(detail, "stockable") && detail.stock !== null && detail.stock > 0 ) rows.push({
        key: "stock",
        icon: "product",
        label: t("details.specs.stock"),
        value: t("details.specs.stockLeft", { count: detail.stock, value: formatNumber(locale, detail.stock) }),
    });

    if ( can(detail, "deliverable") && detail.delivery ) rows.push({
        key: "delivery",
        icon: "luggage",
        label: t("details.specs.delivery"),
        value: t(`details.specs.way.${ detail.delivery }`, { defaultValue: detail.delivery }),
    });

    if ( can(detail, "digital_deliverable") || detail.digital ) rows.push({
        key: "digital",
        icon: "download",
        label: t("details.specs.digital"),
        value: t("details.specs.digitalBody"),
    });

    if ( detail.duration > 0 && detail.durationUnit ) rows.push({
        key: "duration",
        icon: "clock",
        label: t("details.duration"),
        value: t(`details.specs.span.${ detail.durationUnit }`, { count: detail.duration, value: formatNumber(locale, detail.duration) }),
    });

    if ( detail.startsAt ) rows.push({
        key: "starts",
        icon: "calendar",
        label: t("details.specs.starts"),
        value: when.moment(detail.startsAt),
    });

    if ( detail.endsAt ) rows.push({
        key: "ends",
        icon: "calendar",
        label: t("details.specs.ends"),
        value: when.moment(detail.endsAt),
    });

    if ( detail.sku ) rows.push({
        key: "sku",
        icon: "qr",
        label: t("details.specs.sku"),
        value: detail.sku,
    });

    if ( detail.maxQuantity > 0 ) rows.push({
        key: "limit",
        icon: "archiveBox",
        label: t("details.specs.limit"),
        value: t("details.specs.limitBody", { count: detail.maxQuantity, value: formatNumber(locale, detail.maxQuantity) }),
    });

    const seen = covered[shapeOf(detail)];

    return rows.filter(( row ) => !seen.includes(row.key) );

};

export function Specs ({ items }: { items: readonly Spec[] }) {

    const theme = useTheme();

    return (
        <Box align="stretch" row wrap gap="3">
            {items.map(( item ) => (
                <Box key={item.key} style={[ styles.cell, items.length === 1 ? styles.lone : null ]} row align="center" gap="3">
                    <Plate look="quiet" icon={item.icon} size={theme.control.sm.height - theme.space["2"]} />

                    <Box style={styles.copy} gap="0">
                        <Text rank="label" numberOfLines={1}>{item.label}</Text>
                        <Text rank="micro" ink="soft" numberOfLines={1}>{item.value}</Text>
                    </Box>
                </Box>
            ))}
        </Box>
    );

}

const styles = StyleSheet.create({

    cell: {
        flexGrow: 1,
        flexBasis: "44%",
        flexDirection: "row",
        alignItems: "center",
    },
    lone: {
        flexBasis: "100%",
    },
    copy: {
        flex: 1,
    },

});
