import { router } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import type { DiscoveryProps } from "@/components/discovery";
import { usePull } from "@/elements/hooks/use-pull";
import { usePriceTag } from "@/features/catalog/hooks/use-price-tag";
import { figureOf, glyphOf, sceneOf } from "@/features/catalog/marks";
import { useCoverFlight } from "@/features/details/flight";
import { useRewards } from "@/features/home/hooks/use-rewards";
import { discoveryTypes, type Listing } from "@/model/catalog";
import { upcomingOf } from "@/model/order";
import { lodges } from "@/model/search";
import { useAccount } from "@/query/account";
import { useCatalogCensus, useCatalogs, useRecentCatalogs } from "@/query/catalogs";
import { useRecentCategories } from "@/query/categories";
import { useCatalogTypes } from "@/query/contract";
import { useFavoriteToggle } from "@/query/favorites";
import { useAlertCount } from "@/query/notifications";
import { useOffers } from "@/query/offers";
import { useOrders } from "@/query/orders";
import { itemsOf } from "@/query/shelf";
import { dayKey } from "@/std/number";
import { str } from "@/std/str";
import { useSession } from "@/store/session";

const failed = ( query: { isError: boolean; data?: unknown } ): boolean => query.isError && query.data === undefined;

const uncounted: Readonly<Record<string, number>> = {};

export function useHome () {

    const { t } = useTranslation();
    const catalogTypes = useCatalogTypes();
    const census = useCatalogCensus();
    const [ picked, setPicked ] = useState<string | null>(null);
    const token = useSession(( state ) => state.token );
    const profile = useAccount().data;
    const alerts = useAlertCount();
    const deals = useOffers(6);
    const recent = useRecentCatalogs(Boolean(token));
    const orders = useOrders();
    const browsed = useRecentCategories(Boolean(token));

    const counts = census.data ?? ( census.isError ? uncounted : null );
    const types = useMemo(
        () => catalogTypes.data && counts ? discoveryTypes(catalogTypes.data, counts) : [],
        [ catalogTypes.data, counts ],
    );

    const type = picked && types.includes(picked) ? picked : types[0] ?? "";
    const rated = useCatalogs({ type, sort: "highest_rated", limit: 4 }, Boolean(type));
    const popular = useCatalogs({ type, sort: "highest_viewed", limit: 8 }, Boolean(type));
    const fresh = useCatalogs({ type, sort: "newest", limit: 8 }, Boolean(type));
    const value = useCatalogs({ type, sort: "lowest_price", limit: 8 }, Boolean(type));
    const openExplore = useCallback(() => router.push("/explore"), []);
    const openCategories = useCallback(() => router.push("/categories"), []);
    const coverFlight = useCoverFlight();
    const { favoriteOf, toggle } = useFavoriteToggle(() => router.push("/login"));
    const tag = usePriceTag();
    const rewards = useRewards();
    const openOffers = useCallback(() => router.push("/offers"), []);

    const refresh = useCallback(() => {
        void Promise.all([ catalogTypes.refetch(), census.refetch(), alerts.refetch(), deals.refetch(), rated.refetch(), popular.refetch(), fresh.refetch(), value.refetch(), ...( token ? [ recent.refetch(), browsed.refetch() ] : [] ) ]);
    }, [ alerts, browsed, catalogTypes, census, deals, fresh, popular, rated, recent, token, value ]);
    const pull = usePull(refresh);

    const card = ( listing: Listing ) => {
        const loved = favoriteOf(listing.id, listing.favorite);

        return {
            key: String(listing.id),
            title: listing.name,
            note: listing.place,
            image: listing.image,
            icon: glyphOf(listing.type),
            score: listing.rating > 0 ? listing.rating : undefined,
            reviews: listing.reviews > 0 ? listing.reviews : undefined,
            price: tag(listing.price, listing.unit, listing.sale),
            loved,
            loveLabel: t(loved ? "listing.unsave" : "listing.save"),
            onLove: () => toggle(listing.id, listing.favorite),
            onPress: () => router.push(`/catalog/${ listing.id }`),
            flight: coverFlight(listing.id),
        };
    };

    const settling = !type && ( catalogTypes.isPending || census.isPending );
    const label = t(`types.${ type }`, { defaultValue: type });
    const sections: DiscoveryProps["sections"][number][] = [
        { key: `popular:${ type }`, kind: "listings", title: t("home.popularTitle", { type: label }), action: t("common.seeAll"), onAction: openExplore, loading: settling || popular.isLoading, cards: ( popular.data ?? [] ).map(card) },
        { key: "offers", kind: "offers", title: t("home.offersTitle"), action: t("common.seeAll"), onAction: openOffers, loading: deals.isLoading, cards: ( deals.data ?? [] ).map(( offer ) => ({
            key: String(offer.id), title: offer.title, note: offer.body, image: offer.image, icon: glyphOf(offer.type), emblem: sceneOf(offer.type),
            badge: offer.badge ? { label: offer.badge, tint: "accent" as const } : undefined,
            action: t("home.offerAction"), onPress: openOffers,
        })) },
        { key: `rated:${ type }`, kind: "listings", title: t("home.ratedTitle"), note: t("home.ratedBody"), action: t("common.seeAll"), onAction: openExplore, loading: settling || rated.isLoading, cards: ( rated.data ?? [] ).map(card) },
        { key: "recent", kind: "listings", title: t("home.recentTitle"), loading: Boolean(token) && recent.isLoading, cards: token ? ( recent.data ?? [] ).map(card) : [] },
        { key: `fresh:${ type }`, kind: "listings", title: t("home.freshTitle"), action: t("common.seeAll"), onAction: openExplore, loading: settling || fresh.isLoading, cards: ( fresh.data ?? [] ).map(card) },
        { key: `value:${ type }`, kind: "listings", title: t("home.valueTitle"), action: t("common.seeAll"), onAction: openExplore, loading: settling || value.isLoading, cards: ( value.data ?? [] ).map(card) },
        { key: "browsed", kind: "listings", title: t("home.browsedTitle"), action: t("common.seeAll"), onAction: openCategories, loading: Boolean(token) && browsed.isLoading, cards: token ? ( browsed.data ?? [] ).map(( category ) => ({
            key: String(category.id), title: category.name, image: category.image, icon: category.icon ? glyphOf(category.icon) : "sections", shape: "wide" as const,
            note: category.catalogs > 0 ? t("sections.holds", { count: category.catalogs }) : undefined,
            onPress: () => router.push(`/category/${ category.id }`),
        })) : [] },
    ];

    const broken = ( !type && failed(catalogTypes) ) || [ popular, rated, fresh, value ].every(failed);
    const bare = Boolean(type) && !broken && [ popular, rated, fresh, value ].every(( query ) => !query.isLoading && ( query.data?.length ?? 0 ) === 0 );

    const view: DiscoveryProps = {
        hero: { label: t("home.browseAll"), onPress: openCategories },
        search: { hint: t("home.searchHint"), onPress: openExplore, onFilter: () => router.push({ pathname: "/explore", params: { filters: String(Date.now()) } }), filterLabel: t("search.filters") },
        types: { types: types.map(( key ) => ({ key, label: t(`types.${ key }`, { defaultValue: key }), figure: figureOf(key) })), value: type, onChange: setPicked, browse: { label: t("home.browseAll"), onPress: openCategories } },
        profile: { name: str.first(profile?.name), image: profile?.image ?? undefined, label: t("tabs.account"), alerts: t("home.alerts"), count: token ? alerts.data?.unread : undefined, onPress: () => router.push("/account"), onAlerts: () => router.push("/notifications") },
        settling,
        sections: sections.filter(( section ) => section.loading || section.cards.length > 0 ),
        refreshing: pull.refreshing,
        onRefresh: pull.onRefresh,
    };

    const upcoming = upcomingOf(itemsOf(orders.data), dayKey());

    const ranged = ( key: string | null ): boolean => key === null || lodges(catalogTypes.data?.find(( entry ) => entry.key === key )?.capabilities ?? []);

    return { view, rewards, broken, error: catalogTypes.error ?? popular.error, refresh, bare, label, openExplore, kinds: types, type: type || null, ranged, upcoming };

}
