import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Modal, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { boundsAround, MapPlot, type MapPricePoint } from "@/components/map";
import { AppBar } from "@/elements/app-bar";
import { Box } from "@/elements/box";
import { Button } from "@/elements/button";
import { useBars } from "@/elements/hooks/use-bars";
import { useLocate } from "@/elements/hooks/use-locate";
import { Icon } from "@/elements/icon";
import { Media } from "@/elements/media";
import { Press } from "@/elements/press";
import { Round } from "@/elements/round";
import { Text } from "@/elements/text";
import { useMoney } from "@/features/shell/hooks/use-money";
import { nativeMaps } from "@/features/shell/maps";
import type { Listing } from "@/model/catalog";
import type { SearchBounds, SearchQuery } from "@/model/search";
import { notify } from "@/store/notice";
import { useTheme } from "@/theme/use-theme";

type SearchMapProps = {
    open: boolean;
    query: SearchQuery;
    party: string;
    items: readonly Listing[];
    bounds: SearchBounds;
    activeId: number | null;
    onActive: ( id: number ) => void;
    onClose: () => void;
    onFilter: () => void;
    onSearchArea: ( bounds: SearchBounds ) => void;
    onOpen: ( id: number ) => void;
};

export function SearchMap ({
    open,
    query,
    party,
    items,
    bounds,
    activeId,
    onActive,
    onClose,
    onFilter,
    onSearchArea,
    onOpen,
}: SearchMapProps) {

    const { t } = useTranslation();
    const { rt } = useUnistyles();
    const brief = [ query.checkin && query.checkout ? `${ query.checkin } – ${ query.checkout }` : "", party ].filter(Boolean).join(" · ");
    const money = useMoney();
    const theme = useTheme();
    const shown = useBars(open, theme.name === "dark" ? "light" : "dark");
    const locate = useLocate();
    const [ viewport, setViewport ] = useState(bounds);
    const [ located, setLocated ] = useState(false);

    useEffect(() => {

        if ( open ) setViewport(query.bounds ?? bounds);

    }, [ bounds, open, query.bounds ]);

    const points = useMemo<readonly MapPricePoint[]>(() => items
        .filter(( item ) => item.latitude !== null && item.longitude !== null )
        .map(( item ) => ({
            id: item.id,
            latitude: item.latitude as number,
            longitude: item.longitude as number,
            label: item.price ? money.round(item.price.amount, item.price.currency) : item.name,
        })), [ items, money ]);

    const active = items.find(( item ) => item.id === activeId) ?? null;

    const inset = {
        top: rt.insets.top + theme.control.md.height + theme.space["3"] * 2,
        bottom: rt.insets.bottom + ( active ? theme.art.md + theme.space["3"] * 2 : theme.space["3"] ),
    };

    const findMe = () => {

        void locate()
            .then(( spot ) => {

                setLocated(true);
                setViewport(boundsAround(spot.latitude, spot.longitude));

            })
            .catch(() => notify(t("search.locationOff"), "info") );

    };

    return (
        <Modal
            visible={shown}
            animationType="fade"
            presentationStyle="fullScreen"
            statusBarTranslucent
            navigationBarTranslucent
            onRequestClose={onClose}
        >
            <View style={styles.safe}>
                <MapPlot
                    bounds={viewport}
                    points={points}
                    activeId={activeId}
                    onPress={onActive}
                    onBoundsChange={setViewport}
                    native={nativeMaps}
                    located={located}
                    inset={inset}
                />

                <AppBar
                    floating
                    onClose={onClose}
                    title={query.destination || t("search.map")}
                    subtitle={brief || undefined}
                    actions={<Round icon="filter" onPress={onFilter} label={t("search.filters")} />}
                />

                <View style={styles.area} pointerEvents="box-none">
                    <Button label={t("search.searchArea")} icon="refresh" block={false} onPress={() => onSearchArea(viewport) } />
                </View>

                <View style={styles.locate}>
                    {nativeMaps ? <Round icon="locate" onPress={findMe} label={t("search.myLocation")} /> : null}
                    <Round icon="location" onPress={() => setViewport(bounds) } label={t("search.recenter")} />
                </View>

                {active ? (
                    <Press style={styles.preview} onPress={() => onOpen(active.id) } sink="tile" accessibilityRole="button">
                        <Media icon="stay" source={active.image} ratio={1} curve="tag" scrim={false} style={styles.media} />

                        <Box gap="1" style={styles.previewCopy}>
                            <Text rank="label" numberOfLines={1}>{active.name}</Text>
                            <Box row align="center" gap="1">
                                <Icon name="star" size={theme.icon.xs} tint="star" />
                                <Text rank="label">{active.rating.toFixed(1)}</Text>
                                <Text rank="micro" ink="soft">({active.reviews})</Text>
                            </Box>
                            {active.price ? (
                                <Text rank="label">
                                    {money.round(active.price.amount, active.price.currency)}
                                </Text>
                            ) : null}
                        </Box>

                        <Icon name="forward" size={theme.icon.lg} tint="soft" />
                    </Press>
                ) : null}
            </View>
        </Modal>
    );

}

const styles = StyleSheet.create(( theme, runtime ) => ({

    safe: {
        flex: 1,
        backgroundColor: theme.plane[theme.name === "dark" ? "raised" : "well"],
    },
    area: {
        position: "absolute",
        top: runtime.insets.top + theme.control.md.height + theme.space["3"] * 3,
        alignSelf: "center",
    },
    locate: {
        position: "absolute",
        bottom: runtime.insets.bottom + theme.art.lg + theme.space["1"],
        insetInlineStart: theme.space["3"],
        gap: theme.space["2"],
    },
    preview: {
        position: "absolute",
        insetInlineStart: theme.space["3"],
        insetInlineEnd: theme.space["3"],
        bottom: runtime.insets.bottom + theme.space["3"],
        minHeight: theme.art.md,
        flexDirection: "row",
        alignItems: "center",
        gap: theme.space["3"],
        padding: theme.space["3"],
        borderRadius: theme.radius.card,
        backgroundColor: theme.plane.base,
        boxShadow: theme.depth.float.boxShadow,
    },
    media: {
        width: theme.art.sm,
        height: theme.art.sm,
    },
    previewCopy: {
        flex: 1,
    },

}));
