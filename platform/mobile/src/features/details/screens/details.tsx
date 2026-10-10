import { router, useLocalSearchParams } from "expo-router";
import { type ReactNode, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useWindowDimensions, View } from "react-native";
import { useSharedValue } from "react-native-reanimated";
import { StyleSheet } from "react-native-unistyles";
import { ReportLink } from "@/components/report-link";
import { Strip } from "@/components/strip";
import { SummaryBar } from "@/components/summary";
import { Tile } from "@/components/tile";
import { AppBar } from "@/elements/app-bar";
import { Box } from "@/elements/box";
import { Divider } from "@/elements/divider";
import { useFlight } from "@/elements/flight";
import { useMap } from "@/elements/hooks/use-map";
import { useShare } from "@/elements/hooks/use-share";
import { Icon } from "@/elements/icon";
import { Stagger } from "@/elements/motion";
import { Round } from "@/elements/round";
import { Screen } from "@/elements/screen";
import { Scroll } from "@/elements/scroll";
import { Surface } from "@/elements/surface";
import { Text } from "@/elements/text";
import { usePriceTag } from "@/features/catalog/hooks/use-price-tag";
import { glyphOf } from "@/features/catalog/marks";
import { AmenitiesPreview, groupTitle } from "@/features/details/components/amenities";
import { Cover, coverRatio } from "@/features/details/components/cover";
import { Crown } from "@/features/details/components/crown";
import { ComingDays } from "@/features/details/components/days";
import { Faqs } from "@/features/details/components/faqs";
import { HostCard } from "@/features/details/components/host";
import { LocationCard } from "@/features/details/components/location";
import { Nearby } from "@/features/details/components/nearby";
import { Options } from "@/features/details/components/options";
import { type DetailPanel, DetailPanels } from "@/features/details/components/panels";
import { Documents, Included, Notices } from "@/features/details/components/paperwork";
import { Picks } from "@/features/details/components/picks";
import { PolicyLinks, type PolicyPanel } from "@/features/details/components/policies";
import { ReviewsPreview } from "@/features/details/components/reviews";
import { DetailSection } from "@/features/details/components/section";
import { Skeleton } from "@/features/details/components/skeleton";
import { Specs, specsOf } from "@/features/details/components/specs";
import { Deck } from "@/features/details/faces";
import { coverFlightKey, useCoverFlight } from "@/features/details/flight";
import { Trouble } from "@/features/shell";
import { useReportCopy } from "@/features/shell/copy";
import { useMoney } from "@/features/shell/hooks/use-money";
import { useWhen } from "@/features/shell/hooks/use-when";
import { retreat } from "@/features/shell/retreat";
import { cartable } from "@/model/cart";
import { unitOf } from "@/model/catalog";
import { can, consumedOf, type DetailPart, expired, faceOf, factsOf, favoured, featureGroupsOf, marked, sectionsOf, sellable, shapeOf, soldOut, voiceOf } from "@/model/detail";
import { useCartToggle } from "@/query/cart";
import { useAvailability, useCatalog, useRecordView, useReport, useReviews, useSimilar } from "@/query/catalogs";
import { useOpenChat } from "@/query/chat";
import { useRanged } from "@/query/contract";
import { useFavoriteToggle } from "@/query/favorites";
import { addIsoDays, todayIso } from "@/std/date-range";
import { calendarDay } from "@/std/number";
import { notify } from "@/store/notice";
import { useSession } from "@/store/session";
import { useTheme } from "@/theme/use-theme";

export function DetailsScreen () {

    const { t, i18n } = useTranslation();
    const cash = useMoney();
    const tag = usePriceTag();
    const rangedOf = useRanged();
    const reportCopy = useReportCopy();
    const when = useWhen();
    const theme = useTheme();
    const params = useLocalSearchParams<{ id?: string; adults?: string; children?: string; checkin?: string; checkout?: string }>();

    const id = Number(params.id ?? 0);
    const paint = useFlight(( tower ) => tower.paint );
    const inbound = useFlight(( tower ) => tower.trip?.key === coverFlightKey(id) );
    const coverFlight = useCoverFlight();
    const guests = { adults: Math.max(1, Number(params.adults) || 2), children: Math.max(0, Number(params.children) || 0) };
    const stay = params.checkin && params.checkout ? { starts: params.checkin, ends: params.checkout } : null;
    const token = useSession(( state ) => state.token );
    const catalog = useCatalog(id, guests);
    const { favoriteOf, toggle: toggleFavorite } = useFavoriteToggle(() => router.push("/login"));
    const basket = useCartToggle();
    const reports = useReport(id);
    const reviews = useReviews(id, Boolean(catalog.data?.reviews));
    const similar = useSimilar(id);
    const share = useShare();
    const openMap = useMap();
    const recordView = useRecordView();
    const opening = useOpenChat();

    const viewport = useWindowDimensions();
    const heroMark = Math.round(viewport.width * coverRatio) - theme.art.md;
    const [ lit, setLit ] = useState(true);
    const [ crownMark, setCrownMark ] = useState(0);
    const [ picked, setPicked ] = useState<number | null>(null);
    const [ quantity, setQuantity ] = useState(1);
    const [ panel, setPanel ] = useState<DetailPanel>(null);
    const glide = useSharedValue(0);

    const detail = catalog.data;
    const firstDay = todayIso();
    const daily = can(detail, "has_availability") && !can(detail, "perishable");
    const days = useAvailability(id, firstDay, addIsoDays(firstDay, 13), daily);
    const viewed = detail?.id ?? 0;
    const loved = detail ? favoriteOf(detail.id, detail.favorite) : false;

    useEffect(() => {

        if ( viewed > 0 ) recordView(viewed);

    }, [ viewed, recordView ]);

    useEffect(() => {

        if ( !detail ) return;

        const selected = detail.sellables
            .filter(( item ) => item.fits && !item.soldOut )
            .sort(( first, second ) => ( first.price?.amount ?? Infinity ) - ( second.price?.amount ?? Infinity ) )[0];

        setPicked(( current ) => detail.sellables.some(( item ) => item.id === current && item.fits && !item.soldOut ) ? current : selected?.id ?? null);

    }, [ detail ]);

    const requireAccount = ( action: () => void ) => {

        if ( !token ) {
            router.push("/login");
            return;
        }

        action();

    };

    const talk = () => requireAccount(() => {

        if ( opening.isPending ) return;

        opening.mutate({ subject: "catalogs", id }, {
            onSuccess: ( room ) => router.push({ pathname: "/room/[id]", params: { id: String(room), name: detail?.name ?? "" } }),
        });

    });

    const shareDetail = () => {

        if ( !detail ) return;

        void share({
            title: detail.name,
            message: t("details.shareMessage", { name: detail.name, place: detail.place }),
        });

    };

    const save = () => {

        if ( detail ) toggleFavorite(detail.id, detail.favorite);

    };

    const report = ( reason: string, note: string ) => requireAccount(() => {

        reports.mutate({ reason, note }, {
            onSuccess: () => { notify(t("details.reportDone"), "success"); setPanel(null); },
        });

    });

    if ( id > 0 && catalog.isPending ) {

        return (
            <Screen edges={[]} padded={false}>
                <Skeleton />
                <AppBar floating onBack={() => retreat() } />
            </Screen>
        );

    }

    if ( !detail ) {

        return (
            <Screen edges={[ "top" ]} padded={false}>
                <AppBar title={t("details.title")} onBack={() => retreat() } />

                <Trouble reason={catalog.error} onRetry={() => { void catalog.refetch(); }} />
            </Screen>
        );

    }

    const seat = detail.sellables.find(( row ) => row.id === picked );
    const coordinates = detail.coordinates;
    const price = seat?.price && seat.price.amount > 0 ? seat.price : detail.price;
    const sale = marked(price, detail.offer);
    const sold = price !== null && price.amount > 0;
    const unit = unitOf(detail.unit);
    const voice = voiceOf(detail);
    const shape = shapeOf(detail);
    const face = faceOf(detail);
    const specs = specsOf(detail, t, when, i18n.language);
    const money = cash.amount;
    const policyPanel = ( value: PolicyPanel ) => setPanel(value);
    const framed = detail.shots.length > 0;
    const basketAction = cartable(detail.capabilities)
        ? {
            label: basket.cartedOf(detail.id, detail.carted) ? t("cart.added") : t("cart.add"),
            active: basket.cartedOf(detail.id, detail.carted),
            onPress: () => requireAccount(() => basket.toggle(detail.id, detail.carted, detail.capabilities) ),
        }
        : undefined;
    const insured = can(detail, "underwritten");
    const pickKind = insured ? "coverage" : shape;
    const chipped = shape === "document" || shape === "route" || shape === "stage";
    const pickTitle = chipped
        ? t(`details.pick.${ pickKind }`, { defaultValue: t(`details.voice.${ voice }.options`) })
        : t(`details.voice.${ voice }.options`);
    const leaving = ( starts: string ): string | null =>
        stay && starts === stay.starts ? stay.ends
            : rangedOf(detail.capabilities) ? addIsoDays(starts, Math.max(1, detail.minStay)) : null;

    const checkoutAt = ( starts: string | null ) => {

        const ends = starts ? leaving(starts) : null;

        requireAccount(() => router.push({
            pathname: "/checkout",
            params: {
                catalog: String(detail.id),
                sellable: picked ? String(picked) : "",
                quantity: String(quantity),
                adults: String(guests.adults),
                children: String(guests.children),
                ...( starts ? { starts } : {} ),
                ...( ends ? { ends } : {} ),
            },
        }) );

    };

    const book = () => checkoutAt(calendarDay(detail.startsAt) ?? stay?.starts ?? null);

    const closed = expired(detail);
    const paper = factsOf(detail);
    const groups = featureGroupsOf(detail, consumedOf(detail));
    const lone = groups.length === 1 ? groups[0] : undefined;
    const paperwork = paper.papers;
    const notices = paper.notices;

    const blocks: Record<DetailPart, ReactNode> = {

        deck: (
            <Deck
                key="deck"
                detail={detail}
                picked={picked}
                quantity={quantity}
                when={when}
                onPick={setPicked}
                onQuantity={setQuantity}
                onPanel={setPanel}
                onBook={book}
            />
        ),

        availability: daily && days.data?.known && !closed ? (
            <DetailSection key="availability" title={t("details.days.title", { context: voice })} body={t("details.days.body", { context: voice })}>
                <ComingDays availability={days.data} from={detail.sellables.length > 0} offer={detail.offer} onPick={checkoutAt} />
            </DetailSection>
        ) : null,

        about: detail.description ? (
            <DetailSection key="about" title={t(`details.face.${ face }.about`, { defaultValue: t(`details.voice.${ voice }.about`) })} action={t("details.showMore")} onAction={() => setPanel("about") }>
                <Text rank="body" numberOfLines={7}>{detail.description}</Text>
            </DetailSection>
        ) : null,

        included: paper.included.length > 0 ? (
            <DetailSection key="included" title={t("details.included")} body={t("details.includedBody")}>
                <Included items={paper.included} />
            </DetailSection>
        ) : null,

        specs: specs.length > 0 ? (
            <DetailSection key="specs" title={t("details.goodToKnow")}>
                <Specs items={specs} />
            </DetailSection>
        ) : null,

        amenities: groups.length > 0 ? (
            <DetailSection key="amenities" title={lone ? groupTitle(lone.group, t) : t(`details.voice.${ voice }.features`)}>
                <AmenitiesPreview groups={groups} onMore={() => setPanel("amenities") } />
            </DetailSection>
        ) : null,

        options: detail.sellables.length > 1 ? (
            <DetailSection key="options" title={pickTitle} body={chipped ? undefined : t(`details.voice.${ voice }.optionsBody`)}>
                {chipped
                    ? <Picks items={detail.sellables} value={picked} onChange={setPicked} />
                    : <Options items={detail.sellables} value={picked} money={money} onChange={setPicked} />}
            </DetailSection>
        ) : null,

        documents: paperwork.length > 0 ? (
            <DetailSection key="documents" title={t("details.documents")} body={t("details.documentsBody")}>
                <Documents items={paperwork} />
            </DetailSection>
        ) : null,

        notices: notices.length > 0 ? (
            <DetailSection key="notices" title={t("details.notices")}>
                <Notices items={notices} />
            </DetailSection>
        ) : null,

        location: can(detail, "has_location") && detail.place ? (
            <DetailSection key="location" title={t(`details.face.${ face }.where`, { defaultValue: t(`details.voice.${ voice }.locationTitle`) })} body={detail.address || detail.place}>
                <LocationCard
                    place={detail.address || detail.place}
                    latitude={coordinates?.latitude}
                    longitude={coordinates?.longitude}
                    onOpen={coordinates ? () => openMap({ ...coordinates, label: detail.name }) : undefined}
                />

                <Text rank="caption" ink="soft">{t("details.exactLocation")}</Text>
            </DetailSection>
        ) : null,

        nearby: coordinates && detail.spots.length > 0 ? (
            <DetailSection key="nearby" title={t("details.nearby.title")}>
                <Nearby spots={detail.spots} from={coordinates} />
            </DetailSection>
        ) : null,

        host: detail.host ? (
            <DetailSection key="host" title={t(`details.voice.${ voice }.meetHost`)}>
                <HostCard host={detail.host} voice={voice} onMessage={talk} onProfile={() => router.push({ pathname: "/vendor/[id]", params: { id: String(detail.host?.id ?? 0), catalog: String(detail.id) } }) } />
            </DetailSection>
        ) : null,

        reviews: detail.reviews > 0 ? (
            <DetailSection key="reviews" title={favoured(detail) ? undefined : t("details.reviewsTitle", { count: detail.reviews })}>
                {favoured(detail) ? (
                    <Box align="center" gap="2">
                        <Box row align="center" justify="center" gap="3">
                            <Icon name="award" size={theme.icon.xl} />
                            <Text rank="figure" ltr>{detail.rating.toFixed(1)}</Text>
                        </Box>

                        <Text rank="label" align="center">{t(`details.voice.${ voice }.guestFavorite`)}</Text>
                        <Text rank="caption" ink="soft" align="center" style={styles.reviewIntro}>{t(`details.voice.${ voice }.guestFavoriteBody`)}</Text>
                    </Box>
                ) : null}

                <ReviewsPreview
                    items={reviews.data?.items ?? []}
                    count={detail.reviews}
                    rating={detail.rating}
                    spread={reviews.data?.spread ?? []}
                    scored={!favoured(detail)}
                    waiting={reviews.isPending}
                    failure={reviews.isError ? reviews.error : null}
                    onRetry={() => { void reviews.refetch(); }}
                    onMore={() => setPanel("reviews") }
                />
            </DetailSection>
        ) : null,

        faqs: detail.faqs.length > 0 ? (
            <DetailSection key="faqs" title={t("details.faqsTitle")}>
                <Faqs items={detail.faqs} />
            </DetailSection>
        ) : null,

        policies: (
            <DetailSection key="policies" title={t("details.policiesTitle")}>
                <PolicyLinks detail={detail} voice={voice} onOpen={policyPanel} />
            </DetailSection>
        ),

    };

    return (
        <Screen edges={[]} padded={false} plane="base">
            <Scroll
                docked
                contentContainerStyle={[ styles.scroll, framed ? null : styles.bare ]}
                mark={framed ? heroMark : crownMark || undefined}
                onMark={( past ) => setLit(!past) }
                track={framed ? glide : undefined}
            >
                {framed ? (
                    <Cover
                        shots={detail.shots}
                        icon={glyphOf(detail.type)}
                        glide={glide}
                        settled={inbound}
                        onOpen={() => setPanel("gallery") }
                        onReady={() => paint(coverFlightKey(id)) }
                    />
                ) : null}

                <View style={framed ? styles.sheet : styles.plain}>
                    <Surface value="base">
                        <Stagger>
                            <View onLayout={framed ? undefined : ( event ) => setCrownMark(Math.round(event.nativeEvent.layout.height)) }>
                                <Crown detail={detail} onReviews={() => setPanel("reviews") } />
                            </View>

                            {sectionsOf(detail).map(( key ) => blocks[key] )}

                            {( similar.data?.length ?? 0 ) > 0 ? (
                                <DetailSection key="similar" title={t("details.similarTitle")} body={t("details.similarBody")}>
                                    <Strip>
                                        {( similar.data ?? [] ).map(( listing ) => (
                                            <Tile
                                                key={listing.id}
                                                shape="wide"
                                                width={theme.layout.thumb * 2}
                                                title={listing.name}
                                                note={listing.place}
                                                image={listing.image}
                                                icon={glyphOf(listing.type)}
                                                score={listing.rating > 0 ? listing.rating : undefined}
                                                price={tag(listing.price, listing.unit, listing.sale)}
                                                onPress={() => router.replace(`/catalog/${ listing.id }`) }
                                                flight={coverFlight(listing.id)}
                                            />
                                        ))}
                                    </Strip>
                                </DetailSection>
                            ) : null}

                            <View style={styles.report}>
                                <Divider />

                                <ReportLink
                                    {...reportCopy}
                                    label={t("details.report")}
                                    title={t("details.reportTitle")}
                                    body={t("details.reportBody")}
                                    busy={reports.isPending}
                                    onSubmit={report}
                                />
                            </View>

                        </Stagger>
                    </Surface>
                </View>
            </Scroll>

            <AppBar
                floating
                media={framed}
                revealed={!lit}
                title={detail.name}
                onBack={() => retreat() }
                actions={(
                    <>
                        <Round icon="share" onPress={shareDetail} label={t("details.share")} />
                        <Round icon={loved ? "heartSolid" : "heart"} tone={loved ? "danger" : undefined} onPress={save} label={t(loved ? "listing.unsave" : "listing.save")} />
                    </>
                )}
            />

            {sellable(detail) ? (
                <SummaryBar
                    lead={sold && !unit && detail.sellables.length > 1 ? t("details.from") : ""}
                    unit={sold && unit ? t(`listing.unit.${ unit }`, { defaultValue: "" }) : ""}
                    amount={sold && price ? money(( sale ?? price ).amount, price.currency) : t("listing.onRequest")}
                    was={sale && price ? money(price.amount, price.currency) : ""}
                    action={closed ? t("details.face.stage.over") : t(`details.act.${ face }`)}
                    disabled={closed || soldOut(detail, picked) || ( detail.sellables.length > 0 && picked === null )}
                    onAction={book}
                    side={basketAction ? { icon: basketAction.active ? "cartFull" : "cart", label: basketAction.label, on: basketAction.active, onPress: basketAction.onPress } : undefined}
                />
            ) : null}

            <DetailPanels
                detail={detail}
                panel={panel}
                onClose={() => setPanel(null) }
                onShare={shareDetail}
            />
        </Screen>
    );

}

const styles = StyleSheet.create(( theme, runtime ) => ({

    scroll: {
        backgroundColor: theme.plane.base,
    },
    report: {
        gap: theme.space["6"],
        paddingTop: 0,
        paddingHorizontal: theme.layout.gutter,
        paddingBottom: theme.control.md.height + theme.space["3"],
    },
    sheet: {
        marginTop: -theme.space["7"],
        overflow: "hidden",
        borderTopLeftRadius: theme.radius.sheet,
        borderTopRightRadius: theme.radius.sheet,
        backgroundColor: theme.plane.base,
    },
    plain: {
        backgroundColor: theme.plane.base,
    },
    bare: {
        paddingTop: runtime.insets.top + theme.control.md.height + theme.space["6"],
    },
    reviewIntro: {
        maxWidth: theme.art.xl * 2,
    },

}));
