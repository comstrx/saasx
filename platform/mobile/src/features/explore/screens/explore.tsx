import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { Button } from "@/elements/button";
import { Screen } from "@/elements/screen";
import { DateRangeSheet } from "@/features/checkout/components/date-range-sheet";
import { SearchFilters } from "@/features/explore/components/filters";
import { SearchHead } from "@/features/explore/components/head";
import { SearchMap } from "@/features/explore/components/map";
import { SearchPartySheet } from "@/features/explore/components/party";
import { SearchResults } from "@/features/explore/components/results";
import { SearchSortSheet } from "@/features/explore/components/sort";
import { useSearchController } from "@/features/explore/hooks/use-search";
import { Intro } from "@/features/shell/components/intro";
import { emptySearchFacets, emptySupports, lodges, type SearchSeed, searchOf, sortOf, sortsFor } from "@/model/search";
import { useCatalogTypes } from "@/query/contract";
import { useSearchCount, useSearchResults } from "@/query/search";
import { formatDateSpan } from "@/std/date-range";

export function ExploreScreen () {

    const signIn = useCallback(() => router.push("/login"), []);
    const { t, i18n } = useTranslation();
    const params = useLocalSearchParams<{ [K in keyof SearchSeed]?: string } & { filters?: string }>();
    const [ seed ] = useState(() => searchOf(params));
    const search = useSearchController(signIn, seed);
    const results = useSearchResults(search.request);
    const counted = useSearchCount({ ...search.request, filters: search.draft }, search.panel === "filters");
    const asked = useRef("");
    const { openFilters } = search;

    useEffect(() => {

        if ( !params.filters || params.filters === asked.current ) return;

        asked.current = params.filters;
        openFilters();

    }, [ params.filters, openFilters ]);

    const pages = results.data?.pages;
    const first = pages?.[0];
    const items = useMemo(() => ( pages ?? [] ).flatMap(( page ) => page.items ), [ pages ]);
    const total = first?.total ?? 0;
    const facets = first?.facets ?? emptySearchFacets;
    const supports = first?.supports ?? emptySupports;
    const bounds = first?.bounds ?? search.query.bounds;
    const types = useCatalogTypes();
    const chosen = search.draft.types;
    const capabilities = useMemo(() => {

        if ( chosen.length !== 1 ) return [];

        return types.data?.find(( entry ) => entry.key === chosen[0] )?.capabilities ?? [];

    }, [ types.data, chosen ]);
    const lodging = lodges(capabilities);
    const crowd = `${ t("search.guestsAdults", { count: search.query.adults }) } · ${ t("search.guestsRooms", { count: search.query.rooms }) }`;
    const party = lodging ? crowd : "";
    const dates = search.query.checkin && search.query.checkout
        ? formatDateSpan(i18n.language, { start: search.query.checkin, end: search.query.checkout })
        : "";
    const { checkin, checkout, adults, children } = search.query;
    const open = useCallback(( id: number ) => router.push({
        pathname: "/catalog/[id]",
        params: { id: String(id), adults: String(adults), children: String(children), ...( checkin && checkout ? { checkin, checkout } : {} ) },
    }), [ adults, checkin, checkout, children ]);

    return (
        <Screen edges={[ "top" ]} padded={false}>
            <SearchHead
                query={search.query}
                stay={lodging || Boolean(dates)}
                dates={dates}
                party={crowd}
                activeFilters={search.activeFilters}
                hints={search.hints}
                kinds={facets.types}
                place={search.query.destination}
                onHint={( hint ) => {

                    if ( hint.kind === "catalog" ) {
                        open(hint.id);
                        return;
                    }

                    search.applyHint(hint);

                }}
                onKind={search.pickType}
                onDates={search.openDates}
                onParty={search.openParty}
                onClearPlace={search.clearPlace}
                onTermChange={search.setTerm}
                onSubmit={search.submit}
                onFilter={search.openFilters}
            />

            <SearchResults
                list={results}
                items={items}
                total={total}
                order={t(`search.sorts.${ sortOf(search.query) }`)}
                waiting={results.isPlaceholderData}
                favoriteOf={search.favoriteOf}
                onFavorite={search.toggleFavorite}
                onOpen={open}
                onSort={search.openSort}
            />

            <Intro
                page="explore"
                emblem="search"
                tone="info"
                title={t("intro.explore.title")}
                line={t("intro.explore.line")}
                action={t("intro.explore.action")}
                dismiss={t("intro.dismiss")}
                onAction={search.openFilters}
            />

            {bounds && items.length > 0 ? (
                <View pointerEvents="box-none" style={styles.mapSeat}>
                    <View style={styles.mapPill}>
                        <Button label={t("search.map")} icon="map" kind="solid" tint="brand" block={false} onPress={search.showMap} />
                    </View>
                </View>
            ) : null}

            <SearchSortSheet
                open={search.panel === "sort"}
                value={sortOf(search.query)}
                options={sortsFor(search.query, supports)}
                onSelect={search.selectSort}
                onClose={search.closePanel}
            />

            <SearchFilters
                open={search.panel === "filters"}
                value={search.draft}
                facets={facets}
                supports={supports}
                capabilities={capabilities}
                total={counted.data ?? null}
                onChange={search.setDraft}
                onApply={search.applyFilters}
                onReset={search.resetDraft}
                onClose={search.closePanel}
            />

            <DateRangeSheet
                open={search.panel === "dates"}
                value={search.span}
                valid={Boolean(search.span.start && search.span.end)}
                onSelect={search.pickDay}
                onClear={search.clearDates}
                onSave={search.saveDates}
                onClose={search.closePanel}
            />

            <SearchPartySheet
                open={search.panel === "party"}
                value={search.crowd}
                onChange={search.setParty}
                onSave={search.saveParty}
                onClose={search.closePanel}
            />

            {bounds ? (
                <SearchMap
                    open={search.mapOpen}
                    query={search.query}
                    party={party}
                    items={items}
                    bounds={bounds}
                    activeId={search.activePin}
                    onActive={search.setActivePin}
                    onClose={search.hideMap}
                    onFilter={() => {
                        search.hideMap();
                        search.openFilters();
                    }}
                    onSearchArea={search.searchArea}
                    onOpen={open}
                />
            ) : null}
        </Screen>
    );

}

const styles = StyleSheet.create(( theme, runtime ) => ({

    mapSeat: {
        position: "absolute",
        insetInlineStart: 0,
        insetInlineEnd: 0,
        bottom: runtime.insets.bottom + theme.layout.dockClearance - theme.space["3"],
        alignItems: "center",
        zIndex: theme.layer.sticky,
    },
    mapPill: {
        borderRadius: theme.radius.pill,
        backgroundColor: theme.tone.brand.base,
        boxShadow: theme.depth.float.boxShadow,
    },

}));
