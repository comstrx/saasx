import { useTranslation } from "react-i18next";
import { useWindowDimensions, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { Loading } from "@/components/states";
import { Chip } from "@/elements/chip";
import { Empty } from "@/elements/empty";
import { Text } from "@/elements/text";
import { useCoverFlight } from "@/features/details/flight";
import { SearchResult } from "@/features/explore/components/result";
import { Feed } from "@/features/shell";
import type { Paging } from "@/features/shell/components/feed";
import type { Listing } from "@/model/catalog";
import { gridSpan } from "@/std/layout";
import { formatNumber } from "@/std/number";
import { useTheme } from "@/theme/use-theme";

type SearchResultsProps = {
    list: Paging;
    items: readonly Listing[];
    total: number;
    order: string;
    waiting: boolean;
    favoriteOf: ( id: number, initial: boolean ) => boolean;
    onFavorite: ( id: number, initial: boolean ) => void;
    onOpen: ( id: number ) => void;
    onSort: () => void;
};

export function SearchResults ({ list, items, total, order, waiting, favoriteOf, onFavorite, onOpen, onSort }: SearchResultsProps) {

    const { t, i18n } = useTranslation();
    const theme = useTheme();
    const { width } = useWindowDimensions();
    const coverFlight = useCoverFlight();
    const columns = Math.max(1, Math.min(theme.composition.search.columnsMax, Math.floor(( width - theme.layout.gutter * 2 + theme.space["3"] ) / ( theme.composition.search.cardMin + theme.space["3"] ))));
    const span = gridSpan(width, theme.layout.gutter, theme.space["3"], columns);

    return (
        <Feed
            list={list}
            items={items}
            waiting={waiting}
            keyOf={( item ) => String(item.id) }
            key={columns}
            columns={columns}
            render={( item ) => (
                <SearchResult
                    stay={item}
                    width={span}
                    alone={columns === 1}
                    favorite={favoriteOf(item.id, item.favorite)}
                    onPress={() => onOpen(item.id) }
                    onFavorite={() => onFavorite(item.id, item.favorite) }
                    flight={coverFlight(item.id)}
                />
            )}
            header={items.length > 0 && !waiting ? (
                <View style={styles.summary}>
                    <Text rank="label" style={styles.facts}>{t("search.placesFound", { count: total, total: formatNumber(i18n.language, total) })}</Text>

                    <View style={styles.order}>
                        <Chip label={order} icon="sort" onPress={onSort} />
                    </View>
                </View>
            ) : undefined}
            loading={<Loading shape="grid" rows={2} />}
            empty={<Empty emblem="search" title={t("search.emptyTitle")} note={t("search.emptyBody")} />}
            gap="4"
            docked
        />
    );

}

const styles = StyleSheet.create(( theme ) => ({

    summary: {
        flexDirection: "row",
        alignItems: "center",
        gap: theme.space["3"],
        paddingTop: theme.space["2"],
        paddingBottom: theme.space["4"],
    },
    facts: {
        flex: 1,
    },
    order: {
        maxWidth: "55%",
    },

}));
