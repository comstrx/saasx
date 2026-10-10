import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { useWindowDimensions } from "react-native";
import { Loading } from "@/components/states";
import { AppBar } from "@/elements/app-bar";
import { Empty } from "@/elements/empty";
import { Screen } from "@/elements/screen";
import { ListingCard } from "@/features/catalog/components/listing-card";
import { glyphOf } from "@/features/catalog/marks";
import { useCoverFlight } from "@/features/details/flight";
import { Feed, Guest } from "@/features/shell";
import { Intro } from "@/features/shell/components/intro";
import { useNudge } from "@/features/shell/hooks/use-nudge";
import { retreat } from "@/features/shell/retreat";
import { useFavorites, useFavoriteToggle } from "@/query/favorites";
import { itemsOf } from "@/query/shelf";
import { gridSpan } from "@/std/layout";
import { useSession } from "@/store/session";
import { useTheme } from "@/theme/use-theme";

export function FavoritesScreen () {

    const { t } = useTranslation();
    const theme = useTheme();
    const { width } = useWindowDimensions();
    const coverFlight = useCoverFlight();
    const token = useSession(( state ) => state.token );
    const saved = useFavorites();
    const kept = saved.data?.pages[0]?.total ?? 0;

    useNudge("favorites", token && kept > 0 ? t("nudge.favorites", { count: kept }) : null);
    const { favoriteOf, toggle } = useFavoriteToggle(() => router.push("/login"));

    const span = gridSpan(width, theme.layout.gutter, theme.space["3"]);

    if ( !token ) {

        return (
            <Screen edges={[ "top" ]} padded={false}>
                <AppBar title={t("favorites.title")} onBack={() => retreat() } />

                <Guest note={t("favorites.guestBody")} onLogin={() => router.push("/login")} />
            </Screen>
        );

    }

    return (
        <Screen edges={[ "top" ]} padded={false}>
            <AppBar title={t("favorites.title")} onBack={() => retreat() } />

            <Feed
                list={saved}
                items={itemsOf(saved.data)}
                keyOf={( listing ) => String(listing.id) }
                columns={2}
                render={( listing ) => (
                    <ListingCard
                        listing={listing}
                        icon={glyphOf(listing.type)}
                        width={span}
                        shape="panel"
                        favorite={favoriteOf(listing.id, listing.favorite)}
                        onPress={() => router.push(`/catalog/${ listing.id }`) }
                        flight={coverFlight(listing.id)}
                        onFavorite={() => toggle(listing.id, listing.favorite) }
                    />
                )}
                loading={<Loading shape="grid" rows={2} />}
                empty={(
                    <Empty
                        emblem="heart"
                        title={t("favorites.emptyTitle")}
                        note={t("favorites.emptyBody")}
                        action={t("favorites.browse")}
                        onAction={() => router.replace("/") }
                    />
                )}
            />

            <Intro
                page="favorites"
                emblem="heart"
                tone="danger"
                title={t("intro.favorites.title")}
                line={t("intro.favorites.line")}
                dismiss={t("intro.dismiss")}
            />
        </Screen>
    );

}
