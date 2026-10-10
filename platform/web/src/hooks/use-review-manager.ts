"use client";

import { useCallback, useEffect, useState } from "react";
import type { Data } from "@/api/features";
import { useBusyItems } from "@/hooks/use-busy-items";
import { useCheckpoint } from "@/hooks/use-checkpoint";
import { useDiscussionAction } from "@/hooks/use-discussion-action";
import { useFormFields } from "@/hooks/use-form-fields";
import { useRead } from "@/hooks/use-operation";
import { useTranslations } from "@/lib/providers/intl";
import { z } from "@/lib/providers/schema";
import { identity } from "@/lib/spec/config";
import { aspectBook, feedbackErrors, feedbackValues, reviewDraft, reviewPatch } from "@/lib/std/feedback";
import { useUi } from "@/stores/provider";

type Review = Data<"orders", "review">;
type Operation = "update" | "remove" | "restore";
type Selection = { operation: Operation; review: Review };
const archiveSchema = z.array(z.number().int().positive());

export function useReviewManager ( items: readonly Review[], scope: string, catalogId: number | undefined, onChanged: () => void ) {

    const t = useTranslations("reviewActions");
    const errors = useTranslations("feedback.errors");
    const user = useUi(( state ) => state.user);
    const permissions = user?.permissions ?? [];
    const [selected, setSelected] = useState<Selection | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const children = useBusyItems();
    const parseArchive = useCallback(( value: unknown ) => {

        const parsed = archiveSchema.safeParse(value);

        return parsed.success ? [...new Set(parsed.data)] : null;

    }, []);
    const removed = useCheckpoint([identity, "removed-reviews", user?.id ?? "guest", scope].join("."), parseArchive);
    const mutation = useDiscussionAction(scope, selected ? { feature: "reviews", operation: selected.operation } : null);
    const catalog = useRead("products", "view", { productId: catalogId ?? 0 }, {
        enabled: selected?.operation === "update" && !!catalogId,
    });
    const aspects = aspectBook(catalog.data?.capabilities ?? []);
    const form = useFormFields({
        initial: feedbackValues(), failure: mutation.error, clear: mutation.clear,
        validate: ( values ) => Object.fromEntries(Object.entries(feedbackErrors(values, aspects, true))
            .map(( [key, value] ) => [key, errors(value)])),
    });
    const active = (["update", "remove", "restore"] as const)
        .find(( operation ) => operation === (mutation.attempt?.operation ?? selected?.operation));
    const archived = (removed.value ?? []).filter(( id ) => !items.some(( item ) => item.id === id));
    const error = removed.issue ? t("archiveFailed") : mutation.blocked ? t("blocked") : mutation.error
        ? Object.values(mutation.error.errors).flat()[0] || t(mutation.error.status === 403 ? "denied" : "failed") : null;

    const resultId = form.id("result");

    useEffect(() => {

        if ( message ) document.getElementById(resultId)?.focus();

    }, [message, resultId]);

    function owns ( review: Review ) {

        return !!user && review.user?.id === user.id;

    }
    function allowed ( operation: Operation, review: Review ) {

        return owns(review) && permissions.includes(operation === "update" ? "edit_reviews" : "delete_reviews");

    }
    function choose ( operation: Operation, review: Review ) {

        if ( mutation.locked || children.busy || !removed.ready || removed.issue || !allowed(operation, review) ) return;

        mutation.clear();
        setMessage(null);
        form.change(reviewDraft(review));
        setSelected({ operation, review });

    }
    function restore ( id: number ) {

        if ( !user ) return;

        choose("restore", { id, deleted: true, user: { id: user.id } });

    }
    function close () {

        if ( mutation.locked ) return;

        mutation.clear();
        setSelected(null);

    }
    async function submit () {

        if ( !mutation.attempt && (!selected || !allowed(selected.operation, selected.review)) ) return;
        if ( !mutation.attempt && active === "update" && !form.check() ) return;

        const id = mutation.attempt && "reviewId" in mutation.attempt.input
            ? mutation.attempt.input.reviewId : selected?.review.id;
        const patch = selected && active === "update" ? reviewPatch(selected.review, form.values, aspects) : {};

        if ( typeof id !== "number" || id < 1 || !active ) return;

        if ( !mutation.attempt && active === "update" && !Object.keys(patch).length ) {

            close();
            return;

        }

        const result = await mutation.run({ reviewId: id, ...patch });

        if ( !result ) return;
        if ( active === "remove" ) removed.save([...new Set([...(removed.value ?? []), id])]);
        if ( active === "restore" ) removed.save((removed.value ?? []).filter(( value ) => value !== id));

        setMessage(t(active === "remove" ? "removed" : active === "restore" ? "restored" : "saved"));
        setSelected(null);
        onChanged();

    }

    return {
        threads: children.items, threadBusy: children.update, t, form, catalog, aspects, mutation, selected, active,
        archived, error, message,
        allowed, choose, restore, close, submit,
        ready: removed.ready && !removed.issue && mutation.ready,
        canRestore: permissions.includes("delete_reviews"),
    };

}
