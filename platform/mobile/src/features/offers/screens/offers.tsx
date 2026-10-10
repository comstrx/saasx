import { router } from "expo-router";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useWindowDimensions, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { Band } from "@/components/band";
import { Reward } from "@/components/reward";
import { Loading } from "@/components/states";
import { Tile } from "@/components/tile";
import { AppBar } from "@/elements/app-bar";
import { Badge } from "@/elements/badge";
import { Emblem } from "@/elements/emblem";
import { Empty } from "@/elements/empty";
import { chevronNext, Icon } from "@/elements/icon";
import { Stagger } from "@/elements/motion";
import { Press } from "@/elements/press";
import { Screen } from "@/elements/screen";
import { Scroll } from "@/elements/scroll";
import { Shine } from "@/elements/shine";
import { Status } from "@/elements/status";
import { Text } from "@/elements/text";
import { usePriceTag } from "@/features/catalog/hooks/use-price-tag";
import { glyphOf, sceneOf } from "@/features/catalog/marks";
import { useOfferEnd, useOfferMoment } from "@/features/offers/hooks/use-offer-moment";
import { Trouble } from "@/features/shell";
import { retreat } from "@/features/shell/retreat";
import type { Offer } from "@/model/offer";
import { useLevel } from "@/query/account";
import { useCatalogs } from "@/query/catalogs";
import { useCoupons } from "@/query/coupons";
import { useOffers } from "@/query/offers";
import { gridSpan } from "@/std/layout";
import { useSession } from "@/store/session";
import { useTheme } from "@/theme/use-theme";

const deals = 6;

function Campaign ({ offer, onPress }: { offer: Offer; onPress: () => void }) {

    const { t } = useTranslation();
    const theme = useTheme();
    const end = useOfferEnd();
    const urgency = end(offer.endsAt);

    return (
        <Press onPress={onPress} sink="card" accessibilityRole="button" accessibilityLabel={offer.title} style={styles.campaign}>
            <Shine delay={theme.beat.slow} />

            <View style={styles.copy}>
                <View style={styles.marks}>
                    {offer.badge ? <Badge label={offer.badge} tint="accent" solid /> : null}
                    {urgency ? <Status label={urgency.label} tint={urgency.tint} size="sm" /> : null}
                </View>

                <Text rank="display" numberOfLines={2}>{offer.title}</Text>
                {offer.body ? <Text rank="caption" ink="soft" numberOfLines={3}>{offer.body}</Text> : null}

                <View style={styles.discover}>
                    <Text rank="label" color={theme.tone.accent.onSoft} numberOfLines={1}>{t("home.offerAction")}</Text>
                    <Icon name={chevronNext} size={theme.icon.xs} color={theme.tone.accent.onSoft} />
                </View>
            </View>

            <Emblem name={sceneOf(offer.type)} size={theme.composition.offer.art} />
        </Press>
    );

}

function Door ({ emblem, title, note, onPress }: { emblem: "gift" | "medal"; title: string; note: string; onPress: () => void }) {

    const theme = useTheme();

    return (
        <Press onPress={onPress} sink="card" accessibilityRole="button" accessibilityLabel={title} accessibilityHint={note} style={styles.door}>
            <Emblem name={emblem} size={theme.composition.service.art} />

            <View style={styles.fill}>
                <Text rank="title" numberOfLines={1}>{title}</Text>
                <Text rank="caption" ink="soft" numberOfLines={2}>{note}</Text>
            </View>

            <Icon name={chevronNext} size={theme.icon.sm} tint="faint" />
        </Press>
    );

}

export function OffersScreen () {

    const { t } = useTranslation();
    const theme = useTheme();
    const { width } = useWindowDimensions();
    const token = useSession(( state ) => state.token );
    const offers = useOffers(20);
    const listings = useCatalogs({ sort: "highest_ordered", limit: 24 });
    const coupons = useCoupons(false);
    const level = useLevel();
    const tag = usePriceTag();
    const moment = useOfferMoment(() => router.push("/explore"));
    const span = gridSpan(width, theme.layout.gutter, theme.space["3"]);

    const sales = useMemo(() => ( listings.data ?? [] ).filter(( listing ) => listing.sale ).slice(0, deals), [ listings.data ]);
    const waiting = coupons.data?.pages[0]?.total ?? 0;
    const campaigns = offers.data ?? [];

    return (
        <Screen edges={[ "top" ]} padded={false}>
            <AppBar title={t("offers.title")} onBack={() => retreat() } />

            {offers.isError && !offers.data ? <Trouble reason={offers.error} onRetry={() => { void offers.refetch(); }} /> : (
                <Scroll docked contentContainerStyle={styles.page}>
                    <Stagger>
                        <View key="hero" style={styles.hero}>
                            <View style={styles.fill}>
                                <Text rank="label" color={theme.tone.accent.onSoft}>{t("offers.eyebrow")}</Text>
                                <Text rank="hero" numberOfLines={2}>{t("offers.heroTitle")}</Text>
                                <Text rank="body" ink="soft">{t("offers.heroBody")}</Text>
                            </View>

                            <View style={styles.stage}>
                                <View style={styles.aura} />
                                <Emblem name="gift" size={theme.composition.offers.hero} />
                            </View>
                        </View>

                        <View key="campaigns" style={styles.block}>
                            <Band title={t("offers.campaignsTitle")} note={t("offers.campaignsBody")} />

                            {offers.isLoading ? <Loading shape="card" rows={2} /> : campaigns.length === 0 ? (
                                <View style={styles.panel}>
                                    <Empty emblem="gift" title={t("offers.emptyTitle")} note={t("offers.emptyBody")} fill={false} compact />
                                </View>
                            ) : campaigns.map(( offer ) => <Campaign key={offer.id} offer={offer} onPress={() => moment.show(offer) } /> )}
                        </View>

                        {sales.length > 0 ? (
                            <View key="deals" style={styles.block}>
                                <Band title={t("offers.dealsTitle")} note={t("offers.dealsBody")} action={t("common.seeAll")} onAction={() => router.push("/explore") } />

                                <View style={styles.grid}>
                                    {sales.map(( listing ) => (
                                        <Tile
                                            key={listing.id}
                                            title={listing.name}
                                            note={listing.place || undefined}
                                            image={listing.image}
                                            icon={glyphOf(listing.type)}
                                            score={listing.rating > 0 ? listing.rating : undefined}
                                            price={tag(listing.price, listing.unit, listing.sale)}
                                            width={span}
                                            onPress={() => router.push(`/catalog/${ listing.id }`) }
                                        />
                                    ))}
                                </View>
                            </View>
                        ) : null}

                        {token && ( waiting > 0 || level.data ) ? (
                            <View key="yours" style={styles.block}>
                                <Band title={t("offers.yoursTitle")} />

                                {waiting > 0 ? <Door emblem="gift" title={t("offers.couponsTitle")} note={t("offers.couponsNote", { count: waiting })} onPress={() => router.push("/coupons") } /> : null}
                                {level.data ? <Door emblem="medal" title={t("offers.levelTitle", { name: level.data.name })} note={t("offers.levelNote")} onPress={() => router.push("/level") } /> : null}
                            </View>
                        ) : null}
                    </Stagger>
                </Scroll>
            )}

            {moment.moment ? <Reward {...moment.moment} /> : null}
        </Screen>
    );

}

const styles = StyleSheet.create(( theme ) => ({

    page: {
        gap: theme.layout.section,
        paddingHorizontal: theme.layout.gutter,
        paddingTop: theme.space["2"],
    },
    fill: {
        flex: 1,
        gap: theme.space["1"],
    },
    hero: {
        flexDirection: "row",
        alignItems: "center",
        gap: theme.space["3"],
        padding: theme.space["5"],
        borderRadius: theme.radius.panel,
        backgroundColor: theme.plane.base,
    },
    stage: {
        alignItems: "center",
        justifyContent: "center",
    },
    aura: {
        position: "absolute",
        width: theme.composition.offers.aura,
        height: theme.composition.offers.aura,
        borderRadius: theme.radius.pill,
        backgroundColor: theme.tone.accent.soft,
    },
    block: {
        gap: theme.layout.stack,
    },
    panel: {
        padding: theme.space["5"],
        borderRadius: theme.radius.panel,
        backgroundColor: theme.plane.base,
    },
    campaign: {
        overflow: "hidden",
        flexDirection: "row",
        alignItems: "center",
        gap: theme.space["3"],
        padding: theme.space["5"],
        borderRadius: theme.radius.panel,
        backgroundColor: theme.plane.base,
    },
    copy: {
        flex: 1,
        gap: theme.space["2"],
    },
    marks: {
        flexDirection: "row",
        flexWrap: "wrap",
        alignItems: "center",
        gap: theme.space["2"],
    },
    discover: {
        flexDirection: "row",
        alignItems: "center",
        alignSelf: "flex-start",
        gap: theme.space["1"],
        minHeight: theme.mark.sm,
        paddingHorizontal: theme.space["3"],
        borderRadius: theme.radius.pill,
        backgroundColor: theme.tone.accent.soft,
    },
    grid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        rowGap: theme.space["5"],
    },
    door: {
        flexDirection: "row",
        alignItems: "center",
        gap: theme.space["4"],
        padding: theme.space["4"],
        borderRadius: theme.radius.panel,
        backgroundColor: theme.plane.base,
    },

}));
