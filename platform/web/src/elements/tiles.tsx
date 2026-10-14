import type { ReactNode } from "react";

type Props<T> = { items: readonly T[]; keyOf: ( item: T ) => string; render: ( item: T ) => ReactNode };

export default function Tiles<T> ({ items, keyOf, render }: Props<T>) {

    return <ul className="emoji-board">{items.map(( item ) => <li key={keyOf(item)}>{render(item)}</li>)}</ul>;

}
