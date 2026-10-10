type Action = { reaction?: string | null; user?: { id?: number | null } | null };
type Row = { id: number; created_at?: string | null; actions?: readonly Action[] | null; settings?: { reaction?: string | null } | null };

export function chronological ( a: Row, b: Row ): number {

    return (a.created_at ?? "").localeCompare(b.created_at ?? "") || a.id - b.id;

}
export function reactionsOf ( row: Row, me: number | undefined ) {

    const tally = new Map<string, { emoji: string; count: number; mine: boolean }>();
    const own = row.settings?.reaction ? [{ reaction: row.settings.reaction, user: { id: me } }] : [];

    for ( const action of [...(row.actions ?? []).filter(( entry ) => entry.user?.id !== me), ...own] ) {

        if ( !action.reaction ) continue;

        const entry = tally.get(action.reaction) ?? { emoji: action.reaction, count: 0, mine: false };

        tally.set(action.reaction, { ...entry, count: entry.count + 1, mine: entry.mine || action.user?.id === me });

    }

    return [...tally.values()];

}
