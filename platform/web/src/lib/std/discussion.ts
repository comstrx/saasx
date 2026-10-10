type Reply = {
    id: number; user?: { name?: string | null } | null; replies?: readonly Reply[] | null;
};
type Parent = { id: number; name?: string | null };

export type DiscussionRow<T> = { item: T; parent?: Parent };

export function discussionRows<T extends Reply> ( items: readonly T[] ): DiscussionRow<T>[] {

    const result: DiscussionRow<T>[] = [];
    const seen = new Set<number>();
    const queue = items.map(( item ) => ({ item, parent: undefined as Parent | undefined }));

    while ( queue.length ) {

        const next = queue.shift();

        if ( !next || seen.has(next.item.id) ) continue;

        seen.add(next.item.id);
        result.push(next);
        queue.unshift(...(next.item.replies ?? []).map(( item ) => ({
            item: item as T, parent: { id: next.item.id, name: next.item.user?.name },
        })));

    }

    return result;

}

export type WrittenRecord = { title?: string | null; content?: string | null };
type Draft = { title: string; content: string };

export function writtenDraft ( record: WrittenRecord ): Draft {

    return { title: record.title ?? "", content: record.content ?? "" };

}
export function writtenPatch ( record: WrittenRecord, draft: Draft ) {

    return {
        ...(draft.title !== (record.title ?? "") ? { title: draft.title.trim() } : {}),
        ...(draft.content !== (record.content ?? "") ? { content: draft.content.trim() } : {}),
    };

}
export function writtenErrors ( draft: Draft, record?: WrittenRecord ) {

    const changed = !record || draft.content !== (record.content ?? "");

    return {
        ...(draft.title.length > 255 ? { title: "titleLong" as const } : {}),
        ...(changed && !draft.content.trim() ? { content: "required" as const }
            : draft.content.length > 65535 ? { content: "contentLong" as const } : {}),
    };

}
