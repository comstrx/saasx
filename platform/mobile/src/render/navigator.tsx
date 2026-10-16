import Screens from "@/elements/screens";
import { useBackButton, useDeepLinks, useEntries } from "@/hooks/use-router";
import { screenAt } from "@/lib/spec/runtime";
import { type Entry, history } from "@/stores/navigation";
import { EntryPage } from "./page";
import { Tabs } from "./tabs";

function tabbed ( entry: Entry ): boolean {

    return screenAt(entry.path.split("/").filter(Boolean))?.options.presentation === "tab";

}
export function Navigator () {

    const entries = useEntries();
    const cards = entries.map(( entry, index ) => ({
        key: entry.key,
        blocked: history.blocked(entry.key),
        children: index === 0 && tabbed(entry) ? <Tabs current={entry} /> : <EntryPage entry={entry} />,
    }));

    useBackButton();
    useDeepLinks();

    return <Screens cards={cards} onDismissed={history.dismissed} onRefused={() => history.back()} />;

}
