import { formatHref } from "@engine/history";
import * as React from "react";
import { type Entry, EntryContext } from "@/stores/navigation";
import { Page } from "./page";

function same ( a: Entry, b: Entry ): boolean {

    return formatHref(a) === formatHref(b);

}
export function Tabs ({ current }: { current: Entry }) {

    const [kept, setKept] = React.useState<readonly Entry[]>([current]);
    const held = kept.find(( entry ) => entry.path === current.path);
    const active = held && same(held, current) ? held : current;
    const shown = held ? kept.map(( entry ) => (entry === held ? active : entry)) : [...kept, active];

    if ( shown.length !== kept.length || shown.some(( entry, index ) => entry !== kept[index]) ) setKept(shown);

    return shown.map(( entry ) => (

        <React.Activity key={entry.path} mode={entry === active ? "visible" : "hidden"}>

            <EntryContext.Provider value={entry}><Page /></EntryContext.Provider>

        </React.Activity>

    ));

}
