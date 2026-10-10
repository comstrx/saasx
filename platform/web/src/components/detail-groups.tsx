import Stack from "@/elements/stack";
import ChecklistPanel from "./checklist-panel";
import RulesPanel from "./rules-panel";

type Group = { key: string; title: string; items: readonly { key: string; term: string; detail: string; icon?: string }[] };
type Props = { id?: string; groups: readonly Group[] };

const lists = {
    included: { mark: "check-circle", tone: "success" },
    documents: { mark: "file", tone: "accent" },
    entry: { mark: "id-card", tone: "accent" },
    before: { mark: "info", tone: "accent" },
} as const;

function isList ( key: string ): key is keyof typeof lists {

    return Object.hasOwn(lists, key);

}
export default function DetailGroups ({ id, groups }: Props) {

    if ( !groups.length ) return null;

    return (

        <Stack id={id} gap={12}>

            {groups.map(( group ) => isList(group.key) ? (

                <ChecklistPanel key={group.key} title={group.title} items={group.items} {...lists[group.key]} />

            ) : <RulesPanel key={group.key} title={group.title} items={group.items} />)}

        </Stack>

    );

}
