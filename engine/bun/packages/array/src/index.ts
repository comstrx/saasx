export type Key<T> = keyof T | (( item: T ) => unknown);
export type Direction = "asc" | "desc";
export type Upsert<T> = { items: T[]; outcome: "updated" | "inserted" | "unchanged" };

function keyOf<T> ( key: Key<T> ): ( item: T ) => unknown {

    return typeof key === "function" ? key : ( item ) => item[key];

}
export function unique<T> ( items: readonly T[] ): T[] {

    return [...new Set(items)];

}
export function uniqueBy<T> ( items: readonly T[], key: Key<T> ): T[] {

    const pick = keyOf(key);
    const seen = new Set<unknown>();

    return items.filter(( item ) => {

        const id = pick(item);

        if ( seen.has(id) ) return false;

        seen.add(id);

        return true;

    });

}
export function groupBy<T> ( items: readonly T[], key: Key<T> ): Map<unknown, T[]> {

    const pick = keyOf(key);
    const groups = new Map<unknown, T[]>();

    for ( const item of items ) {

        const id = pick(item);
        const group = groups.get(id);

        if ( group ) group.push(item);
        else groups.set(id, [item]);

    }

    return groups;

}
export function indexBy<T> ( items: readonly T[], key: Key<T> ): Map<unknown, T> {

    const pick = keyOf(key);

    return new Map(items.map(( item ) => [pick(item), item]));

}
export function sortBy<T> ( items: readonly T[], key: Key<T>, direction: Direction = "asc" ): T[] {

    const pick = keyOf(key);
    const sign = direction === "asc" ? 1 : -1;

    return items
        .map(( item, index ) => ({ item, index, value: pick(item) }))
        .sort(( left, right ) => {

            if ( left.value === right.value ) return left.index - right.index;
            if ( left.value === undefined || left.value === null ) return 1;
            if ( right.value === undefined || right.value === null ) return -1;

            return (left.value < right.value ? -1 : 1) * sign;

        })
        .map(( entry ) => entry.item);

}
export function chunk<T> ( items: readonly T[], size: number ): T[][] {

    if ( size < 1 ) return [];

    const chunks: T[][] = [];

    for ( let index = 0; index < items.length; index += size ) chunks.push(items.slice(index, index + size));

    return chunks;

}
export function partition<T> ( items: readonly T[], keep: ( item: T ) => boolean ): [T[], T[]] {

    const yes: T[] = [];
    const no: T[] = [];

    for ( const item of items ) (keep(item) ? yes : no).push(item);

    return [yes, no];

}
export function upsertBy<T> ( items: readonly T[], row: T, key: Key<T>, insert = true ): Upsert<T> {

    const pick = keyOf(key);
    const id = pick(row);
    const index = items.findIndex(( item ) => pick(item) === id);

    if ( index >= 0 ) return { items: items.map(( item, at ) => (at === index ? row : item)), outcome: "updated" };
    if ( !insert ) return { items: [...items], outcome: "unchanged" };

    return { items: [...items, row], outcome: "inserted" };

}
export function removeBy<T> ( items: readonly T[], key: Key<T>, id: unknown ): T[] {

    const pick = keyOf(key);

    return items.filter(( item ) => pick(item) !== id);

}
export function move<T> ( items: readonly T[], from: number, to: number ): T[] {

    if ( from < 0 || from >= items.length || to < 0 || to >= items.length ) return [...items];

    const copy = [...items];
    const [item] = copy.splice(from, 1);

    copy.splice(to, 0, item as T);

    return copy;

}
export function range ( count: number, start = 0 ): number[] {

    return Array.from({ length: Math.max(0, count) }, ( _, index ) => start + index);

}
export function sumBy<T> ( items: readonly T[], key: Key<T> ): number {

    const pick = keyOf(key);

    return items.reduce(( total, item ) => total + Number(pick(item) ?? 0), 0);

}
export function zip<A, B> ( left: readonly A[], right: readonly B[] ): [A, B][] {

    const length = Math.min(left.length, right.length);

    return range(length).map(( index ) => [left[index] as A, right[index] as B]);

}
