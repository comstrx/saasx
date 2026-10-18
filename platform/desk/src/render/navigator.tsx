import { useBackKeys, useEntries } from "@/hooks/use-router";
import { EntryPage } from "./page";

export function Navigator () {

    const entries = useEntries();
    const current = entries[entries.length - 1];

    useBackKeys();

    return current ? <EntryPage key={current.key} entry={current} /> : null;

}
