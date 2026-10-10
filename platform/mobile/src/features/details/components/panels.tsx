import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import type { StyleProp, ViewStyle } from "react-native";
import { useWindowDimensions } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { Choice } from "@/components/choice";
import { Viewer } from "@/components/viewer";
import { Box } from "@/elements/box";
import { Chip } from "@/elements/chip";
import { Divider } from "@/elements/divider";
import { Fullscreen } from "@/elements/fullscreen";
import { useDebounced } from "@/elements/hooks/use-debounced";
import { Media } from "@/elements/media";
import { Press } from "@/elements/press";
import { Round } from "@/elements/round";
import { Sheet } from "@/elements/sheet";
import { Text } from "@/elements/text";
import { AmenitiesList } from "@/features/details/components/amenities";
import { CancellationContent, RulesContent, SafetyContent } from "@/features/details/components/policies";
import { ReviewsList } from "@/features/details/components/reviews";
import { type Detail, factsOf, featureGroupsOf, type ReviewSort, type Shot, sortsIn, voiceOf } from "@/model/detail";
import { useReviewFeed } from "@/query/catalogs";

export type DetailPanel =
    | "gallery" | "about" | "amenities" | "reviews"
    | "cancellation" | "rules" | "safety" | null;

type DetailPanelsProps = {
    detail: Detail;
    panel: DetailPanel;
    onClose: () => void;
    onShare: () => void;
};

const mosaic = ( shots: readonly Shot[] ): Shot[][] => {

    const rows: Shot[][] = [];

    for ( let slot = 0; slot < shots.length; slot += 3 ) rows.push(shots.slice(slot, slot + 3));

    return rows;

};

function GalleryContent ({ shots, onOpen }: { shots: readonly Shot[]; onOpen: ( slot: number ) => void }) {

    const viewport = useWindowDimensions();

    const tall = Math.round(viewport.width * 0.84);
    const gap = "1";

    const tile = ( shot: Shot, slot: number, style: StyleProp<ViewStyle> ) => (
        <Press key={shot.id} style={style} onPress={() => onOpen(slot) } sink="tile" accessibilityRole="imagebutton">
            <Media icon="stay" source={shot.picture} ratio={null} scrim={false} style={styles.fill} />
        </Press>
    );

    return (
        <Box gap={gap}>
            {mosaic(shots).map(( row, index ) => {

                const base = index * 3;
                const lead = row[0];

                if ( !lead ) return null;

                if ( row.length < 3 ) return (
                    <Box align="stretch" key={lead.id} style={styles.band(Math.round(tall * 0.62))} row gap={gap}>
                        {row.map(( shot, slot ) => tile(shot, base + slot, styles.cell) )}
                    </Box>
                );

                const stacked = (
                    <Box key="stack" style={styles.cell} gap={gap}>
                        {row.slice(1).map(( shot, slot ) => tile(shot, base + slot + 1, styles.cell) )}
                    </Box>
                );

                return (
                    <Box align="stretch" key={lead.id} style={styles.band(tall)} row gap={gap}>
                        {index % 2 === 0 ? [ tile(lead, base, styles.cell), stacked ] : [ stacked, tile(lead, base, styles.cell) ]}
                    </Box>
                );

            })}
        </Box>
    );

}

function AboutContent ({ detail }: { detail: Detail }) {

    const { t } = useTranslation();

    const specs = factsOf(detail).specs;

    return (
        <Box gap="6">
            <Text rank="body">{detail.description}</Text>

            {specs.length > 0 ? (
                <Box gap="3">
                    <Text rank="title">{t(`details.voice.${ voiceOf(detail) }.aboutPlace`)}</Text>

                    <Box>
                        {specs.map(( fact, index ) => (
                            <Box key={fact.key}>
                                {index > 0 ? <Divider /> : null}

                                <Box style={styles.fact} gap="1">
                                    <Text rank="body">{fact.label}</Text>
                                    {fact.value ? <Text rank="caption" ink="soft">{fact.value}</Text> : null}
                                </Box>
                            </Box>
                        ))}
                    </Box>
                </Box>
            ) : null}

            {detail.instructions ? (
                <Box gap="2">
                    <Text rank="title">{t("details.instructions")}</Text>
                    <Text rank="body" ink="soft">{detail.instructions}</Text>
                </Box>
            ) : null}
        </Box>
    );

}

export function DetailPanels ({ detail, panel, onClose, onShare }: DetailPanelsProps) {

    const { t } = useTranslation();
    const voice = voiceOf(detail);
    const [ shot, setShot ] = useState<number | null>(null);
    const [ sort, setSort ] = useState<ReviewSort>("newest");
    const [ sortOpen, setSortOpen ] = useState(false);
    const [ search, setSearch ] = useState("");
    const needle = useDebounced(search);
    const feed = useReviewFeed(detail.id, sort, needle, panel === "reviews");
    const pages = useMemo(() => detail.shots.map(( held ) => ({ id: held.id, url: held.picture.uri }) ), [ detail.shots ]);

    const orders = sortsIn(feed.data?.supports);

    const sorting = (
        <Chip label={t(`details.reviewSort.${ sort }`)} trailing="down" onPress={() => setSortOpen(true) } />
    );

    const share = <Round icon="share" look="glass" onPress={onShare} label={t("details.share")} />;

    return (
        <>
            <Sheet open={panel === "about"} onClose={onClose} title={t(`details.voice.${ voice }.about`)} scroll tall>
                <AboutContent detail={detail} />
            </Sheet>

            <Fullscreen open={panel === "gallery"} title="" onClose={onClose} action={share} padded={false} tone="stage">
                <GalleryContent shots={detail.shots} onOpen={setShot} />
            </Fullscreen>

            <Viewer
                open={shot !== null}
                items={pages}
                start={shot ?? 0}
                onClose={() => setShot(null) }
            />

            <Fullscreen open={panel === "amenities"} title={t(`details.voice.${ voice }.features`)} onClose={onClose}>
                <AmenitiesList groups={featureGroupsOf(detail)} />
            </Fullscreen>

            <Fullscreen open={panel === "reviews"} title={t("details.reviewsHeader")} onClose={onClose} action={sorting}>
                <ReviewsList
                    items={feed.data?.items ?? []}
                    search={search}
                    busy={feed.isFetching}
                    failure={feed.isError ? feed.error : null}
                    onRetry={() => { void feed.refetch(); }}
                    onSearch={setSearch}
                />
            </Fullscreen>

            <Sheet open={sortOpen} onClose={() => setSortOpen(false) } title={t("details.reviewsOrder")}>
                {orders.map(( option ) => (
                    <Choice
                        key={option}
                        kind="radio"
                        label={t(`details.reviewSort.${ option }`)}
                        selected={sort === option}
                        onPress={() => { setSort(option); setSortOpen(false); }}
                    />
                ))}
            </Sheet>

            <Fullscreen open={panel === "cancellation"} title={t("details.cancellation")} onClose={onClose}>
                <CancellationContent detail={detail} />
            </Fullscreen>

            <Fullscreen open={panel === "rules"} title={t(`details.voice.${ voice }.rules`)} onClose={onClose}>
                <RulesContent detail={detail} />
            </Fullscreen>

            <Fullscreen open={panel === "safety"} title={t(`details.voice.${ voice }.safety`)} onClose={onClose}>
                <SafetyContent detail={detail} />
            </Fullscreen>

        </>
    );

}

const styles = StyleSheet.create(( theme ) => ({

    fill: {
        flex: 1,
    },
    band: ( height: number ) => ({
        height,
    }),
    cell: {
        flex: 1,
    },
    fact: {
        minHeight: theme.control.lg.height,
        paddingVertical: theme.space["3"],
    },

}));
