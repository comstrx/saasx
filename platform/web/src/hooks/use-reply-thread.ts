"use client";

import { useCallback, useEffect, useState } from "react";
import { reply } from "@/api/features/reviews";
import { useBusySignal } from "@/hooks/use-busy-items";
import { useCheckpoint } from "@/hooks/use-checkpoint";
import { useDiscussionAction } from "@/hooks/use-discussion-action";
import { useFormFields } from "@/hooks/use-form-fields";
import { useRead } from "@/hooks/use-operation";
import { useTranslations } from "@/lib/providers/intl";
import { z } from "@/lib/providers/schema";
import { identity } from "@/lib/spec/config";
import { type DiscussionRow, discussionRows, writtenErrors } from "@/lib/std/discussion";
import { hasNextPage } from "@/lib/std/route";
import { useUi } from "@/stores/provider";

type Reply = z.output<typeof reply>;
const openSchema = z.object({ open: z.boolean() });
type Options = { source?: "reviews" | "comments"; rootId: number; scope: string; disabled?: boolean; onBusy?: ( busy: boolean ) => void };

export function useReplyThread ( { source = "reviews", rootId, scope, disabled, onBusy }: Options ) {

    const t = useTranslations("discussion");
    const user = useUi(( state ) => state.user);
    const allowed = !!user?.permissions?.includes("add_replies");
    const [open, setOpen] = useState(false);
    const decodeOpen = useCallback(( value: unknown ) => {

        const parsed = openSchema.safeParse(value);

        return parsed.success ? parsed.data : null;

    }, []);
    const remembered = useCheckpoint([identity, "discussion-open", user?.id ?? "guest", scope].join("."), decodeOpen);
    const [managedBusy, setManagedBusy] = useState(false);
    const [page, setPage] = useState(1);
    const [target, setTarget] = useState<{ id: number; name: string } | null>(null);
    const [posted, setPosted] = useState<DiscussionRow<Reply> | null>(null);
    const [sent, setSent] = useState(false);
    const mutation = useDiscussionAction(scope, { feature: target ? "replies" : source, operation: "reply" });
    const expanded = open || !!remembered.value?.open || !!mutation.attempt || mutation.blocked || managedBusy;
    const reviewThread = useRead("reviews", "replies", { reviewId: rootId, page, limit: 5, sort: "oldest" }, {
        enabled: expanded && source === "reviews",
    });
    const commentThread = useRead("comments", "replies", { commentId: rootId, page, limit: 5, sort: "oldest" }, {
        enabled: expanded && source === "comments",
    });
    const request = source === "comments" ? commentThread : reviewThread;
    const form = useFormFields({
        initial: { title: "", content: "" }, failure: mutation.error, clear: mutation.clear,
        validate: ( values ) => Object.fromEntries(Object.entries(writtenErrors(values))
            .map(( [key, value] ) => [key, t(value)])),
    });
    const rows = discussionRows(request.data ?? []);
    const visible = page === 1 && posted && !rows.some(( row ) => row.item.id === posted.item.id) ? [...rows, posted] : rows;
    const busy = !!mutation.attempt || mutation.pending || mutation.blocked || managedBusy;
    const resultId = form.id("result");

    useBusySignal(busy, onBusy);
    useEffect(() => {

        if ( sent ) document.getElementById(resultId)?.focus();

    }, [sent, resultId]);

    function respond ( item?: Reply ) {

        if ( mutation.locked || disabled || managedBusy || !allowed ) return;

        setSent(false);
        setTarget(item ? { id: item.id, name: item.user?.name || t("guest") } : null);
        requestAnimationFrame(() => document.getElementById(form.id("content"))?.focus());

    }
    async function send () {

        if ( disabled || managedBusy || !mutation.attempt && (!allowed || !form.check()) ) return;

        const parentId = mutation.attempt?.feature === "replies" && "replyId" in mutation.attempt.input
            ? mutation.attempt.input.replyId : target?.id;
        const parent = typeof parentId === "number"
            ? { id: parentId, name: rows.find(( row ) => row.item.id === parentId)?.item.user?.name } : undefined;
        const body = { title: form.values.title.trim(), content: form.values.content.trim() };
        const answer = await mutation.run(target ? { replyId: target.id, ...body }
            : source === "comments" ? { commentId: rootId, ...body } : { reviewId: rootId, ...body });

        if ( !answer ) return;

        const parsed = reply.safeParse(answer.resource);

        if ( parsed.success ) {

            setOpen(true);
            setPosted({ item: parsed.data, parent });
            setSent(true);
            setTarget(null);
            form.change({ title: "", content: "" });
            setPage(1);
            request.reload();

        }

    }
    function changed ( change?: { item?: Reply; removed?: number } ) {

        setPosted(( previous ) => {

            if ( !previous ) return previous;

            const removed = new Set<number>(change?.removed ? [change.removed] : []);

            for ( const row of rows ) {

                if ( row.parent && removed.has(row.parent.id) ) removed.add(row.item.id);

            }

            if ( removed.has(previous.item.id) || previous.parent && removed.has(previous.parent.id) ) return null;
            if ( change?.item?.id === previous.item.id ) return { ...previous, item: change.item };

            return previous;

        });
        setSent(false);
        request.reload();

    }
    function toggle () {

        if ( busy ) return;

        remembered.save({ open: !expanded });
        setOpen(!expanded);

    }

    return {
        managedBusy, setManagedBusy, changed, t, form, request, mutation, target, sent, expanded, visible, allowed,
        page, setPage, send, respond, toggle,
        hasNext: hasNextPage(request.meta?.pagination, request.data?.length ?? 0, 5),
        error: mutation.blocked ? t("blocked") : mutation.error
            ? Object.values(mutation.error.errors).flat()[0] || t(mutation.error.status === 403 ? "denied" : "failed") : null,
    };

}
