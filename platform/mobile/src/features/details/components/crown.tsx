import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { Badge } from "@/elements/badge";
import { Divider } from "@/elements/divider";
import { Icon } from "@/elements/icon";
import { Press } from "@/elements/press";
import { Text } from "@/elements/text";
import { termsWord, traitText } from "@/features/details/lang";
import { usePartyText } from "@/features/shell/copy";
import { type Detail, shapeOf, termsOf, voiceOf } from "@/model/detail";
import { formatNumber } from "@/std/number";
import { acclaimed } from "@/std/rating";
import { useTheme } from "@/theme/use-theme";

type CrownProps = {
    detail: Detail;
    onReviews: () => void;
};

const housed: readonly string[] = [ "bedrooms", "beds", "bathrooms" ];

const seats = [ 0, 1, 2, 3, 4 ];

export function Crown ({ detail, onReviews }: CrownProps) {

    const { t, i18n } = useTranslation();
    const theme = useTheme();
    const party = usePartyText();

    const shape = shapeOf(detail);
    const voice = voiceOf(detail);
    const count = ( value: number ) => formatNumber(i18n.language, value);
    const terms = termsWord(termsOf(detail), t, i18n.language);

    const kind = detail.subtype ? t(`subtypes.${ detail.subtype }`, { defaultValue: "" }) : "";
    const subtitle = kind && detail.place ? t("details.crown.kindIn", { kind, place: detail.place }) : kind || detail.place;

    const heads = detail.adults > 0 ? detail.adults : detail.capacity;
    const span = detail.duration > 0
        ? t(`details.specs.span.${ detail.durationUnit || "day" }`, { count: detail.duration, value: count(detail.duration) })
        : "";
    const rooms = housed
        .map(( key ) => detail.features.find(( row ) => row.key === key && row.value ) )
        .map(( row ) => row ? traitText(row, t, i18n.language) : "" );
    const facts = ( shape === "stay" ? [ heads > 0 ? party(heads, detail.children) : "", ...rooms ]
        : shape === "outing" || shape === "session" ? [ span ]
        : [] ).filter(Boolean);

    const stars = Number(detail.features.find(( row ) => row.key === "star_rating" )?.value ?? 0);
    const rated = detail.reviews > 0 && detail.rating > 0;
    const loved = rated && acclaimed(detail.rating, detail.reviews);

    return (
        <View style={styles.shell}>
            <View style={styles.head}>
                {stars > 0 ? (
                    <View style={styles.stars} accessibilityLabel={t("details.featureUnit.star_rating", { value: count(stars), count: stars })}>
                        {seats.slice(0, stars).map(( seat ) => <Icon key={seat} name="ratingStar" size={theme.icon.xs} tint="star" />)}
                    </View>
                ) : null}

                <Text rank="hero" align="center" numberOfLines={3} accessibilityRole="header">{detail.name}</Text>
                {subtitle ? <Text rank="body" ink="soft" align="center">{subtitle}</Text> : null}
                {facts.length > 0 ? <Text rank="body" ink="soft" align="center">{facts.join(" · ")}</Text> : null}

                {detail.offer || detail.category?.name ? (
                    <View style={styles.marks}>
                        {detail.offer ? <Badge label={t("details.offerFlag", { value: count(detail.offer.rate) })} tint="accent" solid /> : null}

                        {detail.category?.name ? (
                            <Press onPress={() => router.push(`/category/${ detail.category?.id ?? 0 }`) } feel="dim" hitSlop={theme.hit.slop} accessibilityRole="link" style={styles.category}>
                                <Icon name="sections" size={theme.icon.sm} color={theme.tone.brand.onSoft} />
                                <Text rank="label" color={theme.tone.brand.onSoft}>{detail.category.name}</Text>
                            </Press>
                        ) : null}
                    </View>
                ) : null}
            </View>

            <Press onPress={rated ? onReviews : undefined} disabled={!rated} feel="dim" accessibilityRole="button" accessibilityLabel={t("details.rating")} style={styles.accolade}>
                {rated ? (
                    <>
                        <View style={styles.column}>
                            <Text rank="heading" ltr figures>{detail.rating.toFixed(1)}</Text>
                            <View style={styles.stars}>
                                {seats.map(( seat ) => <Icon key={seat} name={detail.rating >= seat + 0.5 ? "ratingStar" : "ratingStarEmpty"} size={theme.icon.xs} tint="star" />)}
                            </View>
                        </View>

                        {loved ? (
                            <>
                                <View style={styles.rule} />

                                <View style={[ styles.column, styles.laurels ]}>
                                    <Icon name="award" size={theme.icon.xl} color={theme.ink.strong} />
                                    <Text rank="label" align="center" numberOfLines={2} style={styles.honour}>{t(`details.voice.${ voice }.guestFavorite`)}</Text>
                                    <Icon name="award" size={theme.icon.xl} color={theme.ink.strong} />
                                </View>
                            </>
                        ) : null}

                        <View style={styles.rule} />

                        <View style={styles.column}>
                            <Text rank="heading" ltr figures>{count(detail.reviews)}</Text>
                            <Text rank="micro" underline>{t("details.crown.reviewsWord", { count: detail.reviews })}</Text>
                        </View>
                    </>
                ) : (
                    <View style={styles.fresh}>
                        <Icon name="ratingStar" size={theme.icon.sm} tint="star" />
                        <Text rank="label">{t("details.fresh")}</Text>
                    </View>
                )}
            </Press>

            {terms ? (
                <>
                    <Divider />

                    <View style={styles.promise}>
                        <Icon name={terms.icon} size={theme.icon.xl} color={theme.ink.strong} />

                        <View style={styles.promiseCopy}>
                            <Text rank="action">{terms.label}</Text>
                            <Text rank="caption" ink="soft">{terms.note}</Text>
                        </View>
                    </View>
                </>
            ) : null}
        </View>
    );

}

const styles = StyleSheet.create(( theme ) => ({

    shell: {
        gap: theme.space["5"],
        paddingTop: theme.space["6"],
        paddingBottom: theme.space["6"],
        paddingHorizontal: theme.layout.gutter,
    },
    head: {
        alignItems: "center",
        gap: theme.space["1.5"],
        paddingHorizontal: theme.space["4"],
    },
    stars: {
        flexDirection: "row",
        direction: "ltr",
    },
    marks: {
        flexDirection: "row",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "center",
        gap: theme.space["3"],
        paddingTop: theme.space["2"],
    },
    category: {
        flexDirection: "row",
        alignItems: "center",
        gap: theme.space["1"],
    },
    accolade: {
        flexDirection: "row",
        alignItems: "center",
        minHeight: theme.composition.crest.accolade,
    },
    column: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        gap: theme.space["1"],
    },
    laurels: {
        flex: 1.6,
        flexDirection: "row",
        gap: theme.space["1"],
    },
    honour: {
        flexShrink: 1,
    },
    rule: {
        width: theme.stroke.hair,
        alignSelf: "stretch",
        marginVertical: theme.space["3"],
        backgroundColor: theme.line.soft,
    },
    fresh: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: theme.space["2"],
    },
    promise: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: theme.space["4"],
    },
    promiseCopy: {
        flex: 1,
        gap: theme.space["1"],
    },

}));
