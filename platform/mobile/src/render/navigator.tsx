import Screens from "@/elements/screens";
import { useBackButton, useDeepLinks, useEntries } from "@/hooks/use-router";
import { EntryContext, history } from "@/stores/navigation";
import { Page } from "./page";

export function Navigator () {

    const entries = useEntries();
    const cards = entries.map(( entry ) => ({
        key: entry.key,
        blocked: history.blocked(entry.key),
        children: <EntryContext.Provider value={entry}><Page /></EntryContext.Provider>,
    }));

    useBackButton();
    useDeepLinks();

    return <Screens cards={cards} onDismissed={history.dismissed} onRefused={() => history.back()} />;

}
