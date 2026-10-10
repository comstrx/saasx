"use client";

import { useEffect, useState } from "react";
import type { Data } from "@/api/features";
import orders from "@/api/features/orders";
import { useFormFields } from "@/hooks/use-form-fields";
import { useRead } from "@/hooks/use-operation";
import { useOrderMutation } from "@/hooks/use-order-mutation";
import { useTranslations } from "@/lib/providers/intl";
import { aspectBook, feedbackErrors, feedbackInput, feedbackValues } from "@/lib/std/feedback";
import { hasNextPage } from "@/lib/std/route";
import { useUi } from "@/stores/provider";

type Order = Data<"orders", "view">;
type Review = Data<"orders", "review">;

export function useOrderReview ( order: Order, onChanged: () => void ) {

    const t = useTranslations("feedback");
    const errorText = useTranslations("feedback.errors");
    const user = useUi(( state ) => state.user);
    const allowed = !!user?.permissions?.includes("add_reviews");
    const [open, setOpen] = useState(false);
    const [busy, setBusy] = useState(false);
    const [page, setPage] = useState(1);
    const [posted, setPosted] = useState<Review | null>(null);
    const history = useRead("orders", "reviews", { orderId: order.id, page, limit: 5, sort: "newest" });
    const catalog = useRead("products", "view", { productId: order.catalog?.id ?? 0 },
        { enabled: open && allowed && !!order.catalog?.id });
    const aspects = aspectBook(catalog.data?.capabilities ?? []);
    const mutation = useOrderMutation(order.id, "review", "reviews");
    const form = useFormFields({
        initial: feedbackValues(), failure: mutation.error, clear: mutation.clear,
        validate: ( values ) => Object.fromEntries(Object.entries(feedbackErrors(values, aspects))
            .map(( [key, value] ) => [key, errorText(value)])),
    });
    const values = mutation.attempt ? feedbackValues(mutation.attempt.input) : form.values;
    const items = history.data ?? [];
    const rows = page === 1 && posted && !items.some(( row ) => row.id === posted.id) ? [posted, ...items] : items;
    const canWrite = allowed && !!order.can_review && !posted && !items.some(( row ) => row.user?.id === user?.id);
    const recovering = !!mutation.attempt || mutation.blocked;
    const id = form.id("result");

    useEffect(() => {

        if ( posted ) document.getElementById(id)?.focus();

    }, [posted, id]);

    useEffect(() => {

        if ( mutation.error?.status === 409 && ["exists", "invalid_state"].includes(mutation.error.reason ?? "") ) {

            history.reload();
            onChanged();

        }

    }, [mutation.error, history.reload, onChanged]);

    async function send () {

        if ( !mutation.attempt && (!canWrite || !form.check()) ) return;

        const result = await mutation.run({ orderId: order.id, ...feedbackInput(form.values, aspects) });

        if ( !result ) return;

        const parsed = orders.review.output.safeParse(result.resource);

        if ( parsed.success ) {

            setPosted(parsed.data);
            setOpen(false);
            setPage(1);
            history.reload();
            onChanged();

        }

    }
    function begin () {

        if ( canWrite && !mutation.locked && !busy ) {

            mutation.clear();
            setOpen(true);

        }

    }
    function close () {

        if ( !mutation.locked ) {

            mutation.clear();
            setOpen(false);

        }

    }
    function changed () {

        setPosted(null);
        history.reload();
        onChanged();

    }

    return {
        busy, setBusy, changed, t, form, values, history, catalog, aspects, mutation, rows, posted, canWrite, recovering,
        open, page, setPage, begin, close, send,
        hasNext: hasNextPage(history.meta?.pagination, items.length, 5),
        error: mutation.blocked ? t("blocked") : mutation.error
            ? Object.values(mutation.error.errors).flat()[0] || t(mutation.error.status === 403 ? "denied" : "failed")
            : !canWrite && open ? t("unavailable") : null,
    };

}
