"use client";

import { useCallback, useEffect, useState } from "react";
import { reply } from "@/api/features/reviews";
import { useBusyItems, useBusySignal } from "@/hooks/use-busy-items";
import { useCheckpoint } from "@/hooks/use-checkpoint";
import { useDiscussionAction } from "@/hooks/use-discussion-action";
import { useFormFields } from "@/hooks/use-form-fields";
import { useTranslations } from "@/lib/providers/intl";
import { z } from "@/lib/providers/schema";
import { identity } from "@/lib/spec/config";
import { type DiscussionRow, writtenDraft, writtenErrors, writtenPatch } from "@/lib/std/discussion";
import { useUi } from "@/stores/provider";

type Reply = z.output<typeof reply>;
type Operation = "update" | "remove" | "restore";
type Selection = { operation: Operation; item: Reply };
type Options = {
    items: readonly DiscussionRow<Reply>[]; scope: string; disabled?: boolean;
    onChanged: ( change?: { item?: Reply; removed?: number } ) => void; onBusy?: ( busy: boolean ) => void;
};
const archiveSchema = z.array(z.number().int().positive());

export function useReplyManager ( { items, scope, disabled, onChanged, onBusy }: Options ) {

    const t = useTranslations("replyActions");
    const messages = useTranslations("discussion");
    const user = useUi(( state ) => state.user);
    const permissions = user?.permissions ?? [];
    const [selected, setSelected] = useState<Selection | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const children = useBusyItems();
    const decode = useCallback(( value: unknown ) => {

        const parsed = archiveSchema.safeParse(value);

        return parsed.success ? [...new Set(parsed.data)] : null;

    }, []);
    const removed = useCheckpoint([identity, "removed-replies", user?.id ?? "guest", scope].join("."), decode);
    const mutation = useDiscussionAction([scope, "manage"].join("."),
        selected ? { feature: "replies", operation: selected.operation } : null);
    const active = (["update", "remove", "restore"] as const)
        .find(( operation ) => operation === (mutation.attempt?.operation ?? selected?.operation));
    const form = useFormFields({
        initial: writtenDraft({}), failure: mutation.error, clear: mutation.clear,
        validate: ( values ) => Object.fromEntries(Object.entries(writtenErrors(values, selected?.item))
            .map(( [key, value] ) => [key, messages(value)])),
    });
    const busy = !!mutation.attempt || mutation.pending || mutation.blocked || children.busy;
    const archived = (removed.value ?? []).filter(( id ) => !items.some(( row ) => row.item.id === id));
    const resultId = form.id("result");

    useBusySignal(busy, onBusy);
    useEffect(() => { if ( message ) document.getElementById(resultId)?.focus(); }, [message, resultId]);

    function allowed ( operation: Operation, item: Reply ) {

        return !!user && item.user?.id === user.id
            && permissions.includes(operation === "update" ? "edit_replies" : "delete_replies");

    }
    function choose ( operation: Operation, item: Reply ) {

        if ( disabled || mutation.locked || children.busy || !removed.ready || removed.issue || !allowed(operation, item) ) return;

        mutation.clear();
        setMessage(null);
        form.change(writtenDraft(item));
        setSelected({ operation, item });

    }
    function restore ( id: number ) {

        if ( user ) choose("restore", { id, deleted: true, user: { id: user.id } });

    }
    function close () {

        if ( mutation.locked ) return;

        mutation.clear();
        setSelected(null);

    }
    async function submit () {

        if ( disabled || !mutation.attempt && (!selected || !allowed(selected.operation, selected.item)) ) return;
        if ( !mutation.attempt && active === "update" && !form.check() ) return;

        const id = mutation.attempt && "replyId" in mutation.attempt.input ? mutation.attempt.input.replyId : selected?.item.id;
        const patch = selected && active === "update" ? writtenPatch(selected.item, form.values) : {};

        if ( typeof id !== "number" || id < 1 || !active ) return;

        if ( !mutation.attempt && active === "update" && !Object.keys(patch).length ) {

            close();
            return;

        }

        const result = await mutation.run({ replyId: id, ...patch });

        if ( !result ) return;
        if ( active === "remove" ) removed.save([...new Set([...(removed.value ?? []), id])]);
        if ( active === "restore" ) removed.save((removed.value ?? []).filter(( value ) => value !== id));

        const updated = active === "update" ? reply.safeParse(result.resource) : null;

        setMessage(t(active === "remove" ? "removed" : active === "restore" ? "restored" : "saved"));
        setSelected(null);
        onChanged({ item: updated?.success ? updated.data : undefined, removed: active === "remove" ? id : undefined });

    }

    return {
        t, form, mutation, children, busy, active, archived, message, allowed, choose, restore, close, submit,
        canRestore: permissions.includes("delete_replies"),
        locked: !!disabled || mutation.locked || children.busy || !removed.ready || removed.issue,
        error: removed.issue ? t("archiveFailed") : mutation.blocked ? t("blocked") : mutation.error
            ? Object.values(mutation.error.errors).flat()[0] || t(mutation.error.status === 403 ? "denied" : "failed") : null,
    };

}
