import { router, useLocalSearchParams } from "expo-router";
import { useTranslation } from "react-i18next";
import { useWindowDimensions, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { Band } from "@/components/band";
import { Group } from "@/components/group";
import { Review } from "@/components/review";
import { Loading } from "@/components/states";
import { Strip } from "@/components/strip";
import { AppBar } from "@/elements/app-bar";
import { Avatar } from "@/elements/avatar";
import { Button } from "@/elements/button";
import { Divider } from "@/elements/divider";
import { Empty } from "@/elements/empty";
import { Icon } from "@/elements/icon";
import { Stagger } from "@/elements/motion";
import { Row } from "@/elements/row";
import { Screen } from "@/elements/screen";
import { Scroll } from "@/elements/scroll";
import { Text } from "@/elements/text";
import { ListingCard } from "@/features/catalog/components/listing-card";
import { glyphOf } from "@/features/catalog/marks";
import { useCoverFlight } from "@/features/details/flight";
import { OrderCard } from "@/features/orders/components/order-card";
import { Trouble } from "@/features/shell";
import { useWhen } from "@/features/shell/hooks/use-when";
import { retreat } from "@/features/shell/retreat";
import { failureShape } from "@/model/failure";
import { useCatalogs, useHostReviews, useVendor } from "@/query/catalogs";
import { useOpenChat } from "@/query/chat";
import { useOrders } from "@/query/orders";
import { itemsOf } from "@/query/shelf";
import { gridSpan } from "@/std/layout";
import { formatNumber } from "@/std/number";
import { useSession } from "@/store/session";
import { useTheme } from "@/theme/use-theme";

const tenureOf = ( since: string | null ): { years: number; months: number } => {

    const start = since ? Date.parse(since) : Number.NaN;

    if ( Number.isNaN(start) ) return { years: 0, months: 0 };

    const months = Math.max(0, Math.floor(( Date.now() - start ) / ( 30.44 * 86400000 )));

    return { years: Math.floor(months / 12), months };

};

export function VendorScreen () {

    const { t, i18n } = useTranslation();
    const theme = useTheme();
    const when = useWhen();
    const { width } = useWindowDimensions();
    const params = useLocalSearchParams<{ id?: string; catalog?: string }>();
    const id = Number(params.id ?? 0);
    const token = useSession(( state ) => state.token );
    const span = gridSpan(width, theme.layout.gutter, theme.space["3"]);
    const coverFlight = useCoverFlight();

    const listings = useCatalogs({ vendor_id: id, limit: 12, sort: "highest_reviewed" }, id > 0);
    const anchor = Number(params.catalog ?? 0) || listings.data?.[0]?.id || 0;
    const vendor = useVendor(id);
    const host = vendor.data ?? null;

    const feed = useHostReviews(id);
    const reviews = { items: feed.data?.items ?? [] };
    const orders = useOrders();
    const mine = itemsOf(orders.data).filter(( order ) => order.vendorId === id );
    const opening = useOpenChat();

    const count = ( value: number ) => formatNumber(i18n.language, value);
    const tenure = tenureOf(host?.memberSince ?? null);
    const name = host?.name || t("vendor.title");

    const talk = () => {

        if ( !token ) {

            router.push("/login");

            return;

        }

        if ( opening.isPending ) return;

        if ( anchor <= 0 ) {

            void listings.refetch();

            return;

        }

        opening.mutate({ subject: "catalogs", id: anchor }, {
            onSuccess: ( room ) => router.push({ pathname: "/room/[id]", params: { id: String(room), name } }),
        });

    };

    const waiting = vendor.isPending && !host;

    if ( id <= 0 || ( !waiting && !host ) ) return (
        <Screen edges={[ "top" ]} padded={false}>
            <AppBar title={t("vendor.title")} onBack={() => retreat() } />
            {vendor.isError && id > 0 && failureShape(vendor.error).code !== "not_found"
                ? <Trouble reason={vendor.error} onRetry={() => { void vendor.refetch(); }} />
                : <Empty emblem="lost" title={t("vendor.missing")} />}
        </Screen>
    );

    const stats = host ? [
        { key: "listings", value: count(host.catalogs), label: t("vendor.listings", { count: host.catalogs }) },
        ...( host.reviews > 0 ? [ { key: "rating", value: host.rating.toFixed(1), label: t("vendor.rating") } ] : [] ),
        tenure.years > 0
            ? { key: "tenure", value: count(tenure.years), label: t("vendor.years", { count: tenure.years }) }
            : { key: "tenure", value: count(Math.max(1, tenure.months)), label: t("vendor.months", { count: Math.max(1, tenure.months) }) },
    ] : [];

    return (
        <Screen edges={[ "top" ]} padded={false}>
            <AppBar title={t("vendor.title")} onBack={() => retreat() } />

            <Scroll contentContainerStyle={styles.scroll}>
                {waiting || !host ? <Loading shape="card" rows={2} /> : (
                    <Stagger>
                        <View key="passport" style={styles.passport}>
                            <View style={styles.face}>
                                <View>
                                    <Avatar name={host.name} source={host.image} size={theme.art.sm} {...( host.verified ? { halo: true } : {} )} />

                                    {host.verified ? (
                                        <View style={styles.seal}>
                                            <Icon name="check" size={theme.icon.xs} tint="lit" />
                                        </View>
                                    ) : null}
                                </View>

                                <Text rank="heading" align="center" numberOfLines={2}>{host.name}</Text>
                                <Text rank="caption" ink="soft">{t(host.verified ? "vendor.verified" : "vendor.host")}</Text>
                            </View>

                            <View style={styles.stats}>
                                {stats.map(( stat, index ) => (
                                    <View key={stat.key}>
                                        {index > 0 ? <Divider /> : null}

                                        <View style={styles.stat}>
                                            <Text rank="heading" ltr figures>{stat.value}</Text>
                                            <Text rank="note" ink="soft">{stat.label}</Text>
                                        </View>
                                    </View>
                                ))}
                            </View>
                        </View>

                        {host.verified || host.responseRate > 0 ? (
                            <Group key="facts">
                                {host.verified ? <Row key="identity" tone="success" icon="verified" plated title={t("vendor.identity")} /> : null}

                                {host.responseRate > 0 ? (
                                    <Row key="rate" tone="info" icon="bolt" plated title={t("details.hostResponseRate", { value: host.responseRate })} />
                                ) : null}
                            </Group>
                        ) : null}

                        <Button key="message" label={t("vendor.message")} icon="chat" block={false} loading={opening.isPending || ( anchor <= 0 && listings.isFetching )} onPress={talk} />

                        {listings.isError && !listings.data ? (
                            <Band key="listings" title={t("vendor.listingsTitle", { name: host.name })} note={t("vendor.listingsNote", { count: host.catalogs })}>
                                <Trouble reason={listings.error} onRetry={() => { void listings.refetch(); }} compact />
                            </Band>
                        ) : ( listings.data?.length ?? 0 ) > 0 ? (
                            <Band key="listings" title={t("vendor.listingsTitle", { name: host.name })} note={t("vendor.listingsNote", { count: host.catalogs })}>
                                <View style={styles.grid}>
                                    {( listings.data ?? [] ).map(( listing ) => (
                                        <ListingCard
                                            key={listing.id}
                                            listing={listing}
                                            icon={glyphOf(listing.type)}
                                            width={span}
                                            shape="panel"
                                            onPress={() => router.push(`/catalog/${ listing.id }`) }
                                            flight={coverFlight(listing.id)}
                                        />
                                    ))}
                                </View>
                            </Band>
                        ) : null}

                        {reviews.items.length > 0 ? (
                            <Band key="reviews" title={t("vendor.reviewsTitle", { name: host.name })}>
                                <Strip gap="3">
                                    {reviews.items.slice(0, 9).map(( review ) => (
                                        <Review
                                            key={review.id}
                                            look="card"
                                            width={theme.layout.thumb * 2.4}
                                            name={review.author.name}
                                            avatar={review.author.image}
                                            body={review.content || review.title}
                                            score={review.rating}
                                            when={review.date ? when.month(review.date) : undefined}
                                        />
                                    ))}
                                </Strip>
                            </Band>
                        ) : null}

                        {mine.length > 0 ? (
                            <Band key="orders" title={t("vendor.ordersTitle", { name: host.name })}>
                                <View style={styles.orders}>
                                    {mine.slice(0, 3).map(( order ) => (
                                        <OrderCard key={order.id} order={order} at={when.date(order.at)} onPress={() => router.push(`/order/${ order.id }`) } />
                                    ))}
                                </View>
                            </Band>
                        ) : null}
                    </Stagger>
                )}
            </Scroll>
        </Screen>
    );

}

const styles = StyleSheet.create(( theme ) => ({

    scroll: {
        gap: theme.layout.stack,
        paddingHorizontal: theme.layout.gutter,
    },
    passport: {
        ...theme.card,
        flexDirection: "row",
        alignItems: "center",
        gap: theme.space["4"],
        padding: theme.space["5"],
        borderRadius: theme.radius.panel,
    },
    face: {
        flex: 1.2,
        alignItems: "center",
        gap: theme.space["1"],
    },
    seal: {
        position: "absolute",
        insetInlineEnd: 0,
        bottom: theme.space["1"],
        width: theme.control.sm.height - theme.space["2"],
        height: theme.control.sm.height - theme.space["2"],
        borderRadius: theme.radius.pill,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: theme.tone.brand.base,
        borderWidth: theme.stroke.base * 2,
        borderColor: theme.plane.base,
    },
    stats: {
        flex: 1,
    },
    stat: {
        paddingVertical: theme.space["2"],
    },
    grid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        rowGap: theme.space["5"],
    },
    orders: {
        gap: theme.space["2"],
    },

}));
