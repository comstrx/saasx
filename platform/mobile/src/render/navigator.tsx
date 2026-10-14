import Screens from "@/elements/screens";
import { useBackButton, useDeepLinks, useEntries } from "@/hooks/use-router";
import { screenAt } from "@/lib/spec/runtime";
import { type Entry, EntryContext, history } from "@/stores/navigation";
import { Page } from "./page";
import { Tabs } from "./tabs";

function tabbed ( entry: Entry ): boolean {

    return screenAt(entry.path.split("/").filter(Boolean))?.options.presentation === "tab";

}
export function Navigator () {

    const entries = useEntries();
    const cards = entries.map(( entry, index ) => ({
        key: entry.key,
        blocked: history.blocked(entry.key),
        children: index === 0 && tabbed(entry) ? <Tabs current={entry} /> : <EntryContext.Provider value={entry}><Page /></EntryContext.Provider>,
    }));

    useBackButton();
    useDeepLinks();

    return <Screens cards={cards} onDismissed={history.dismissed} onRefused={() => history.back()} />;

}
