import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useWindowDimensions, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { AppBar } from "@/elements/app-bar";
import { Box } from "@/elements/box";
import { Empty } from "@/elements/empty";
import { usePull } from "@/elements/hooks/use-pull";
import { Media } from "@/elements/media";
import { Stagger } from "@/elements/motion";
import { Screen } from "@/elements/screen";
import { Scroll } from "@/elements/scroll";
import { Text } from "@/elements/text";
import { ListingCard } from "@/features/catalog/components/listing-card";
import { glyphOf } from "@/features/catalog/marks";
import { useCoverFlight } from "@/features/details/flight";
import { SectionCard } from "@/features/sections/components/section-card";
import { SectionSkeleton } from "@/features/sections/components/skeleton";
import { Trouble } from "@/features/shell";
import { retreat } from "@/features/shell/retreat";
import { branchesOf } from "@/model/category";
import { useCategories, useCategory, useCategoryCatalogs } from "@/query/categories";
import { useFavoriteToggle } from "@/query/favorites";
import { gridSpan } from "@/std/layout";
import { useTheme } from "@/theme/use-theme";

export function SectionScreen () {

    const { t } = useTranslation();
    const theme = useTheme();
    const { width } = useWindowDimensions();
    const coverFlight = useCoverFlight();
    const params = useLocalSearchParams<{ id?: string }>();

    const id = Number(params.id ?? 0) || 0;
    const category = useCategory(id);
    const listed = useCategoryCatalogs(id);
    const tree = useCategories();
    const pull = usePull(() => Promise.all([ category.refetch(), listed.refetch() ]));
    const { favoriteOf, toggle } = useFavoriteToggle(() => router.push("/login"));

    const data = category.data;
    const items = listed.data ?? [];
    const children = branchesOf(tree.data ?? []).find(( branch ) => branch.root.id === id )?.children ?? [];

    const span = gridSpan(width, theme.layout.gutter, theme.space["3"]);
    const waiting = id > 0 && listed.isPending && !listed.data;
    const failed = listed.isError && !listed.data;
    const bare = listed.data !== undefined && items.length === 0 && children.length === 0;
    const fold = Math.round(width / 1.7) - theme.control.md.height - theme.space["6"];
    const [ past, setPast ] = useState(false);

    if ( category.isError && !data ) {

        return (
            <Screen edges={[ "top" ]} padded={false}>
                <AppBar title={t("sections.title")} onBack={() => retreat() } />

                <Trouble reason={category.error} onRetry={() => { void category.refetch(); }} />
            </Screen>
        );

    }

    return (
        <Screen edges={[]} padded={false}>
            <Scroll
                contentContainerStyle={styles.scroll}
                refreshing={pull.refreshing}
                onRefresh={pull.onRefresh}
                mark={fold}
                onMark={setPast}
            >
                <Media scrim
                    source={data?.image}
                    icon="sections"
                    ratio={1.7}
                    style={styles.hero}
                >
                    <Box gap="1" style={styles.headline}>
                        <Text rank="heading" tint="on" numberOfLines={2}>{data?.name ?? ""}</Text>

                        {data?.summary ? (
                            <Text rank="caption" tint="on" numberOfLines={3}>{data.summary}</Text>
                        ) : null}
                    </Box>
                </Media>

                {waiting ? (
                    <SectionSkeleton span={span} />
                ) : bare ? (
                    <Empty
                        emblem="folder"
                        title={t("sections.emptyListingsTitle")}
                        note={t("sections.emptyListingsBody")}
                    />
                ) : (
                    <Stagger>
                        {children.length > 0 ? (
                            <View key="children" style={styles.block}>
                                <Text rank="heading" style={styles.heading}>{t("sections.inside")}</Text>

                                <View style={styles.grid}>
                                    {children.map(( child ) => (
                                        <SectionCard
                                            key={child.id}
                                            category={child}
                                            width={span}
                                            onPress={() => router.push(`/category/${ child.id }`) }
                                        />
                                    ))}
                                </View>
                            </View>
                        ) : null}

                        {failed ? (
                            <View key="failed" style={styles.block}>
                                <Trouble reason={listed.error} onRetry={() => { void listed.refetch(); }} compact />
                            </View>
                        ) : items.length > 0 ? (
                            <View key="listings" style={styles.block}>
                                <Text rank="heading" style={styles.heading}>{t("sections.listings")}</Text>

                                <View style={styles.grid}>
                                    {items.map(( listing ) => (
                                        <ListingCard
                                            key={listing.id}
                                            listing={listing}
                                            icon={glyphOf(listing.type)}
                                            width={span}
                                            shape="panel"
                                            favorite={favoriteOf(listing.id, listing.favorite)}
                                            onPress={() => router.push(`/catalog/${ listing.id }`) }
                                            flight={coverFlight(listing.id)}
                                            onFavorite={() => toggle(listing.id, listing.favorite) }
                                        />
                                    ))}
                                </View>
                            </View>
                        ) : null}
                    </Stagger>
                )}
            </Scroll>

            <AppBar floating media revealed={past} title={data?.name ?? ""} onBack={() => retreat() } />
        </Screen>
    );

}

const styles = StyleSheet.create(( theme ) => ({

    scroll: {
    },
    hero: {
        backgroundColor: theme.plane[theme.name === "dark" ? "raised" : "well"],
    },
    headline: {
        position: "absolute",
        insetInlineStart: theme.layout.gutter,
        insetInlineEnd: theme.layout.gutter,
        bottom: theme.space["5"],
    },
    block: {
        gap: theme.space["3"],
        paddingTop: theme.space["6"],
    },
    heading: {
        paddingHorizontal: theme.layout.gutter,
    },
    grid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: theme.space["3"],
        paddingHorizontal: theme.layout.gutter,
    },

}));
