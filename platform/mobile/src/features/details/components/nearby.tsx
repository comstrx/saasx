import { useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { Icon, type IconName } from "@/elements/icon";
import { Tabs } from "@/elements/tabs";
import { Text } from "@/elements/text";
import type { Spot } from "@/model/detail";
import { metersBetween, type Point } from "@/std/geo";
import { formatNumber } from "@/std/number";
import { useTheme } from "@/theme/use-theme";

type Shelf = "sights" | "transit" | "shops" | "care";

const shelfOf: Readonly<Record<string, Shelf>> = {
    landmark: "sights",
    museum: "sights",
    park: "sights",
    beach: "sights",
    religious: "sights",
    airport: "transit",
    station: "transit",
    mall: "shops",
    hospital: "care",
    university: "care",
};

const glyphOf: Readonly<Record<string, IconName>> = {
    landmark: "landmark",
    museum: "museum",
    park: "tree",
    beach: "beach",
    religious: "mosque",
    airport: "travel",
    station: "train",
    mall: "product",
    hospital: "firstAid",
    university: "graduation",
};

const shelfGlyph: Readonly<Record<Shelf, IconName>> = { sights: "landmark", transit: "train", shops: "product", care: "firstAid" };

const shelves: readonly Shelf[] = [ "sights", "transit", "shops", "care" ];

const pace = 80;

const walkable = 2500;

const shown = 5;

type NearbyProps = {
    spots: readonly Spot[];
    from: Point;
};

export function Nearby ({ spots, from }: NearbyProps) {

    const { t, i18n } = useTranslation();
    const theme = useTheme();
    const [ picked, setPicked ] = useState<Shelf | null>(null);

    const placed = spots
        .flatMap(( spot ) => spot.at && shelfOf[spot.kind] ? [ { ...spot, meters: metersBetween(from, spot.at) } ] : [] )
        .sort(( first, second ) => first.meters - second.meters );
    const present = shelves.filter(( shelf ) => placed.some(( spot ) => shelfOf[spot.kind] === shelf ) );
    const live = picked && present.includes(picked) ? picked : present[0];

    if ( !live ) return null;

    const count = ( value: number, digits = 0 ) => formatNumber(i18n.language, value, digits);
    const distance = ( meters: number ) => meters < 1000
        ? t("details.nearby.meters", { value: count(Math.max(10, Math.round(meters / 10) * 10)) })
        : t("details.nearby.km", { value: count(Math.round(meters / 100) / 10, 1) });
    const reach = ( meters: number ) => meters <= walkable
        ? t("details.nearby.walk", { minutes: count(Math.max(1, Math.round(meters / pace))), distance: distance(meters) })
        : distance(meters);

    return (
        <View style={styles.shell}>
            {present.length > 1 ? (
                <Tabs
                    options={present.map(( shelf ) => ({ key: shelf, label: t(`details.nearby.shelf.${ shelf }`), icon: shelfGlyph[shelf] }) )}
                    active={live}
                    onPick={setPicked}
                />
            ) : null}

            <View style={styles.rows}>
                {placed.filter(( spot ) => shelfOf[spot.kind] === live ).slice(0, shown).map(( spot ) => (
                    <View key={spot.id} style={styles.row}>
                        <Icon name={glyphOf[spot.kind] ?? "location"} size={theme.icon.lg} color={theme.ink.strong} />
                        <Text rank="body" numberOfLines={1} style={styles.name}>{spot.name}</Text>
                        <Text rank="caption" ink="soft" numberOfLines={1}>{reach(spot.meters)}</Text>
                    </View>
                ))}
            </View>

            <Text rank="caption" ink="soft">{t("details.nearby.note")}</Text>
        </View>
    );

}

const styles = StyleSheet.create(( theme ) => ({

    shell: {
        gap: theme.space["4"],
    },
    rows: {
        gap: theme.space["3"],
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
        gap: theme.space["3"],
        minHeight: theme.control.sm.height,
    },
    name: {
        flex: 1,
    },

}));
