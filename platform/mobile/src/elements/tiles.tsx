import { type ReactNode, useCallback, useState } from "react";
import { FlatList, type LayoutChangeEvent, type ListRenderItem, StyleSheet, View } from "react-native";

type Props<T> = { items: readonly T[]; side: number; keyOf: ( item: T ) => string; render: ( item: T ) => ReactNode; empty?: ReactNode | undefined };

const styles = StyleSheet.create({ fill: { flex: 1 }, cell: { alignItems: "center", justifyContent: "center" } });

export default function Tiles<T> ({ items, side, keyOf, render, empty }: Props<T>) {

    const [width, setWidth] = useState(0);
    const columns = Math.max(1, Math.floor(width / side));
    const measure = useCallback(( event: LayoutChangeEvent ) => setWidth(event.nativeEvent.layout.width), []);
    const layout = useCallback(( _data: unknown, index: number ) => ({ length: side, offset: side * index, index }), [side]);
    const cell = useCallback<ListRenderItem<T>>(({ item }) => <View style={[styles.cell, { width: width / columns, height: side }]}>{render(item)}</View>, [render, width, columns, side]);

    return (

        <View style={styles.fill} onLayout={measure} accessibilityRole="list">

            {width ? <FlatList key={columns} data={items} numColumns={columns} keyExtractor={keyOf} renderItem={cell} getItemLayout={layout} initialNumToRender={columns * 8} maxToRenderPerBatch={columns * 4} windowSize={5} removeClippedSubviews keyboardShouldPersistTaps="handled" ListEmptyComponent={empty ? <View>{empty}</View> : null} /> : null}

        </View>

    );

}
