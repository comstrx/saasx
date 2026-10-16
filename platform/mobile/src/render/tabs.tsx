import { formatHref } from "engine/history";
import { useState } from "react";
import Panes from "@/elements/panes";
import type { Entry } from "@/stores/navigation";
import { EntryPage } from "./page";

function same ( a: Entry, b: Entry ): boolean {

    return formatHref(a) === formatHref(b);

}
export function Tabs ({ current }: { current: Entry }) {

    const [kept, setKept] = useState<readonly Entry[]>([current]);
    const held = kept.find(( entry ) => entry.path === current.path);
    const active = held && same(held, current) ? held : current;
    const shown = held ? kept.map(( entry ) => (entry === held ? active : entry)) : [...kept, active];

    if ( shown.length !== kept.length || shown.some(( entry, index ) => entry !== kept[index]) ) setKept(shown);

    return <Panes panes={shown.map(( entry ) => ({ key: entry.path, active: entry === active, children: <EntryPage entry={entry} /> }))} />;

}
