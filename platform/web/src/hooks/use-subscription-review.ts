"use client";

import { useState } from "react";
import { useAuthError } from "@/hooks/use-auth-error";
import { useAction, useRead } from "@/hooks/use-operation";
import { useToast } from "@/hooks/use-toast";
import { useLocale, useTranslations } from "@/lib/providers/intl";
import { day } from "@/lib/std/format";

export function useSubscriptionReview ( subscriptionId: number | null, onDone: () => void ) {

    const t = useTranslations("subscriptions");
    const locale = useLocale();
    const toast = useToast();
    const reviews = useRead("subscriptions", "reviews", { subscriptionId: subscriptionId ?? 0, limit: 3 }, {
        enabled: subscriptionId != null,
    });
    const review = useAction("subscriptions", "review");
    const [values, setValues] = useState<Record<string, string>>({});
    const [errors, setErrors] = useState<Record<string, string>>({});
    const failure = useAuthError(review.error);
    const remote = review.error?.errors ?? {};

    function change ( patch: Record<string, string> ) {

        setValues(( current ) => ({ ...current, ...patch }));
        setErrors(( current ) => Object.fromEntries(Object.entries(current).filter(( [key] ) => !(key in patch))));

    }
    async function submit () {

        if ( !subscriptionId || review.pending ) return;

        const rating = Number(values.rating);
        const content = (values.content ?? "").trim();
        const missing = {
            ...(rating >= 1 ? {} : { rating: t("ratingRequired") }),
            ...(content ? {} : { content: t("contentRequired") }),
        };

        setErrors(missing);

        if ( Object.keys(missing).length ) return;

        const result = await review.run({
            subscriptionId, rating, content, ...(values.title?.trim() ? { title: values.title.trim() } : {}),
        });

        if ( !result ) return;

        toast({ title: t("reviewed"), tone: "success" });
        setValues({});
        onDone();

    }

    return {
        values, change, submit,
        pending: review.pending,
        errors: { ...Object.fromEntries(Object.entries(remote).map(( [key, list] ) => [key, list[0] ?? ""])), ...errors },
        error: Object.keys(remote).length ? null : failure,
        past: (reviews.data ?? []).map(( entry ) => ({
            id: entry.id,
            title: entry.title ?? null,
            content: entry.content ?? null,
            rating: Number(entry.rating ?? 0),
            date: entry.created_at ? day(entry.created_at, locale, { dateStyle: "medium" }) : null,
        })),
    };

}
