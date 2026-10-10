import { useTranslation } from "react-i18next";
import { useWindowDimensions, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { Review } from "@/components/review";
import { Loading } from "@/components/states";
import { Box } from "@/elements/box";
import { Button } from "@/elements/button";
import { Empty } from "@/elements/empty";
import { Field } from "@/elements/field";
import { Rating } from "@/elements/rating";
import { Scroll } from "@/elements/scroll";
import { Text } from "@/elements/text";
import { Trouble } from "@/features/shell";
import { useWhen } from "@/features/shell/hooks/use-when";
import type { Review as ReviewEntry } from "@/model/detail";
import { useTheme } from "@/theme/use-theme";

const voiced = ( review: ReviewEntry, date: ( value: string | null | undefined ) => string ) => ({
    name: review.author.name,
    avatar: review.author.image,
    when: date(review.date),
    score: review.rating,
    body: review.content,
});

const stars = [ 5, 4, 3, 2, 1 ] as const;

type RatingSpreadProps = {
    rating: number;
    spread: readonly number[];
    scored: boolean;
};

function RatingSpread ({ rating, spread, scored }: RatingSpreadProps) {

    const total = spread.reduce(( sum, count ) => sum + count, 0);

    if ( total === 0 ) return null;

    return (
        <View style={styles.spread}>
            {scored ? (
                <View style={styles.score}>
                    <Text rank="figure" ltr figures>{rating.toFixed(1)}</Text>
                    <Rating score={rating} plain />
                </View>
            ) : null}

            <View style={styles.bars}>
                {stars.map(( star ) => (
                    <View key={star} style={styles.bar}>
                        <Text rank="micro" ink="soft" ltr figures style={styles.star}>{star}</Text>
                        <View style={styles.track}>
                            <View style={[ styles.fill, { width: `${ Math.round(( spread[5 - star] ?? 0 ) / total * 100) }%` } ]} />
                        </View>
                    </View>
                ))}
            </View>
        </View>
    );

}

type ReviewsPreviewProps = {
    items: readonly ReviewEntry[];
    count: number;
    rating: number;
    spread: readonly number[];
    scored: boolean;
    waiting: boolean;
    failure: unknown;
    onRetry: () => void;
    onMore: () => void;
};

export function ReviewsPreview ({ items, count, rating, spread, scored, waiting, failure, onRetry, onMore }: ReviewsPreviewProps) {

    const { t } = useTranslation();
    const when = useWhen();
    const theme = useTheme();
    const viewport = useWindowDimensions();

    if ( items.length === 0 ) {

        if ( waiting ) return <Loading shape="card" rows={1} />;

        if ( failure ) return <Trouble reason={failure} onRetry={onRetry} compact />;

        return <Text rank="body" ink="soft">{t("details.noReviews")}</Text>;

    }

    const width = viewport.width - theme.space["10"] - theme.space["5"];
    const shown = items.slice(0, 4);

    return (
        <Box gap="5">
            <RatingSpread rating={rating} spread={spread} scored={scored} />

            <Scroll
                horizontal
                contentContainerStyle={styles.rail}
                showsHorizontalScrollIndicator={false}
                snapToInterval={width + theme.space["3"]}
                snapToAlignment="start"
                decelerationRate="fast"
                disableIntervalMomentum
            >
                {shown.map(( review ) => <Review key={review.id} look="card" width={width} {...voiced(review, when.date)} />)}
            </Scroll>

            {count > shown.length ? <Button label={t("details.showReviews", { count })} kind="soft" tint="neutral" onPress={onMore} /> : null}
        </Box>
    );

}

type ReviewsListProps = {
    items: readonly ReviewEntry[];
    search: string;
    busy: boolean;
    failure: unknown;
    onRetry: () => void;
    onSearch: ( value: string ) => void;
};

export function ReviewsList ({ items, search, busy, failure, onRetry, onSearch }: ReviewsListProps) {

    const { t } = useTranslation();
    const when = useWhen();

    const searching = search.trim().length > 0;

    if ( items.length === 0 && failure && !busy ) {

        return (
            <Box style={styles.empty}>
                <Trouble reason={failure} onRetry={onRetry} />
            </Box>
        );

    }

    if ( items.length === 0 && !searching && !busy ) {

        return (
            <Box style={styles.empty}>
                <Empty emblem="star" title={t("details.reviewsEmptyTitle")} note={t("details.reviewsEmptyBody")} />
            </Box>
        );

    }

    return (
        <Box gap="6">
            <Field
                value={search}
                onChangeText={onSearch}
                icon="search"
                placeholder={t("details.searchReviews")}
                returnKeyType="search"
            />

            <Box style={busy ? styles.settling : undefined} gap="8">
                {items.map(( review ) => <Review key={review.id} {...voiced(review, when.date)} />)}
                {items.length === 0 && !busy ? <Text rank="body" ink="soft">{t("details.noMatchingReviews")}</Text> : null}
            </Box>
        </Box>
    );

}

const styles = StyleSheet.create(( theme ) => ({

    rail: {
        gap: theme.space["3"],
    },
    spread: {
        flexDirection: "row",
        alignItems: "center",
        gap: theme.space["6"],
    },
    score: {
        alignItems: "center",
        gap: theme.space["1"],
    },
    bars: {
        flex: 1,
        gap: theme.space["1.5"],
    },
    bar: {
        flexDirection: "row",
        alignItems: "center",
        gap: theme.space["2"],
    },
    star: {
        minWidth: theme.space["3"],
    },
    track: {
        flex: 1,
        height: theme.composition.detail.bar,
        overflow: "hidden",
        borderRadius: theme.radius.pill,
        backgroundColor: theme.line.soft,
    },
    fill: {
        height: theme.composition.detail.bar,
        borderRadius: theme.radius.pill,
        backgroundColor: theme.ink.strong,
    },
    empty: {
        paddingVertical: theme.space["8"],
    },
    settling: {
        opacity: theme.fade.hush,
    },

}));
