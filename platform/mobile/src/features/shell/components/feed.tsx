import { FlashList, type FlashListRef } from "@shopify/flash-list";
import { type ReactElement, useRef } from "react";
import { useTranslation } from "react-i18next";
import { type NativeScrollEvent, type NativeSyntheticEvent, RefreshControl, ScrollView, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import type { Step } from "@/elements/box";
import { Button } from "@/elements/button";
import { useClearance } from "@/elements/dock/floor";
import { usePull } from "@/elements/hooks/use-pull";
import { Appear, Greet, useReflow } from "@/elements/motion";
import { usePullSkin } from "@/elements/pull";
import { useRail } from "@/elements/scroll/rail";
import { Spinner } from "@/elements/spinner";
import { Text } from "@/elements/text";
import { Trouble } from "@/features/shell/components/trouble";
import { failureShape } from "@/model/failure";
import { useTheme } from "@/theme/use-theme";

export type Paging = {
    data: unknown;
    error: unknown;
    isPending: boolean;
    isError: boolean;
    refetch: () => unknown;
    hasNextPage?: boolean | undefined;
    isFetchingNextPage?: boolean | undefined;
    fetchNextPage?: (() => Promise<unknown>) | undefined;
};

type FeedProps<T> = {
    list: Paging;
    items: readonly T[];
    keyOf: ( item: T ) => string;
    render: ( item: T ) => ReactElement;
    loading: ReactElement;
    empty: ReactElement;
    header?: ReactElement | undefined;
    headerGap?: Step | undefined;
    waiting?: boolean | undefined;
    columns?: number | undefined;
    gap?: Step | undefined;
    docked?: boolean | undefined;
};

type Slot = "flex-start" | "center" | "flex-end";

const greeted = 8;

const slotOf = ( index: number, columns: number ): Slot => {

    const at = index % columns;

    return at === 0 ? "flex-start" : at === columns - 1 ? "flex-end" : "center";

};

export function Feed<T> ({ list, items, keyOf, render, loading, empty, header, headerGap = "0", waiting = false, columns = 1, gap = "2", docked = false }: FeedProps<T>) {

    const { t } = useTranslation();
    const theme = useTheme();
    const floor = useClearance(docked);
    const rail = useRail();
    const skin = usePullSkin();
    const pull = usePull(list.refetch);
    const shelf = useRef<FlashListRef<T>>(null);
    const rows = waiting ? [] : items;

    useReflow(rows.map(keyOf), () => shelf.current?.prepareForLayoutAnimationRender() );

    const ride = ( event: NativeSyntheticEvent<NativeScrollEvent> ) => {

        if ( rail ) rail.value = event.nativeEvent.contentOffset.y;

    };
    const space = theme.space[gap];

    const more = () => {

        if ( list.hasNextPage && !list.isFetchingNextPage ) void list.fetchNextPage?.();

    };

    const stalled = list.isError && Boolean(list.data) && items.length > 0;

    const tail = list.isFetchingNextPage
        ? <View style={styles.more}><Spinner size={theme.icon.md} /></View>
        : stalled
            ? (
                <View style={styles.more}>
                    <Text rank="caption" ink="soft" align="center">{failureShape(list.error).title}</Text>
                    <View style={styles.centred}>
                        <Button label={t("common.retry")} kind="soft" compact block={false} icon="refresh" onPress={() => { void list.fetchNextPage?.(); }} />
                    </View>
                </View>
            )
            : null;

    const blank = waiting || ( list.isPending && !list.data )
        ? loading
        : list.isError && !list.data
        ? <Trouble reason={list.error} onRetry={() => { void list.refetch(); }} compact={Boolean(header)} />
        : empty;

    const settled = !waiting && !list.isPending && items.length === 0;

    if ( settled ) return (
        <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={styles.content(floor)}
            refreshControl={<RefreshControl refreshing={pull.refreshing} onRefresh={pull.onRefresh} {...skin} />}
            showsVerticalScrollIndicator={false}
            onScroll={ride}
            scrollEventThrottle={16}
        >
            {header ? <View style={{ paddingBottom: theme.space[headerGap] }}>{header}</View> : null}
            <View style={styles.hollow}>{blank}</View>
        </ScrollView>
    );

    return (
        <Greet painted={rows.length > 0}>
            <FlashList
                ref={shelf}
                data={rows}
                keyExtractor={keyOf}
                numColumns={columns}
                renderItem={({ item, index }) => {

                    const seat = columns > 1
                        ? <View style={styles.cell(slotOf(index, columns), space)}>{render(item)}</View>
                        : render(item);

                    return index < greeted
                        ? <Appear from="below" travel={theme.travel.near} delay={Math.min(index, theme.beat.cap) * theme.beat.stagger}>{seat}</Appear>
                        : seat;

                }}
                ItemSeparatorComponent={columns > 1 ? undefined : () => <View style={styles.gap(space)} />}
                ListHeaderComponent={header ? <View style={{ paddingBottom: theme.space[headerGap] }}>{header}</View> : undefined}
                ListEmptyComponent={blank}
                ListFooterComponent={tail}
                onEndReached={more}
                onEndReachedThreshold={0.6}
                maintainVisibleContentPosition={{ disabled: true }}
                contentContainerStyle={styles.content(floor)}
                onScroll={ride}
                scrollEventThrottle={16}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                refreshControl={<RefreshControl refreshing={pull.refreshing} onRefresh={pull.onRefresh} {...skin} />}
            />
        </Greet>
    );

}

const styles = StyleSheet.create(( theme ) => ({

    hollow: {
        flexGrow: 1,
        justifyContent: "center",
    },
    content: ( floor: number ) => ({
        flexGrow: 1,
        paddingHorizontal: theme.layout.gutter,
        paddingBottom: floor,
    }),
    cell: ( align: Slot, bottom: number ) => ({
        flex: 1,
        alignItems: align,
        paddingBottom: bottom,
    }),
    gap: ( height: number ) => ({ height }),
    centred: {
        flexDirection: "row",
        justifyContent: "center",
    },
    more: {
        alignItems: "center",
        gap: theme.space["3"],
        paddingVertical: theme.space["5"],
    },

}));
