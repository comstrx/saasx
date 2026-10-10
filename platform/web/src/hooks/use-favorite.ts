"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useAction } from "@/hooks/use-operation";
import type { FavoriteState } from "@/hooks/use-product-favorites";
import { useTranslations } from "@/lib/providers/intl";
import { useUi } from "@/stores/provider";

type Options = { productId: number; state: FavoriteState };

export function useFavorite ( { productId, state }: Options ) {

    const t = useTranslations("favorites");
    const ready = useUi(( value ) => value.ready);
    const token = useUi(( value ) => value.token);
    const user = useUi(( value ) => value.user);
    const [attempt, setAttempt] = useState<boolean | null>(null);
    const [outcome, setOutcome] = useState<{ saved: boolean; version: object | null } | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const saved = outcome && outcome.version === state.version ? outcome.saved : state.saved;
    const desired = attempt ?? saved !== true;
    const action = useAction("products", desired ? "favorite" : "unfavorite");
    const permissions = user?.permissions ?? [];
    const allowed = permissions.includes(desired ? "add_favorites" : "delete_favorites");
    const visible = !token || permissions.includes("add_favorites") || permissions.includes("delete_favorites");
    const id = useId();
    const unknown = saved === null && attempt === null;
    const retry = action.error !== null;
    const restore = useRef<"read" | "write" | null>(null);

    useEffect(() => {

        const done = restore.current === "read" ? !state.loading && !state.failed && saved !== null
            : restore.current === "write" && !action.pending && (!!action.error || !!message);

        if ( !done ) return;

        restore.current = null;
        document.getElementById(`${id}-control`)?.focus();

    }, [state.loading, state.failed, saved, action.pending, action.error, message, id]);

    function refresh () {

        restore.current = "read";
        state.reload();

    }
    async function toggle () {

        if ( !ready || !token || !allowed || action.pending || saved === null && attempt === null ) return;

        restore.current = "write";
        setMessage(null);
        setAttempt(desired);

        const result = await action.run({ productId });

        if ( !result ) return;

        setOutcome({ saved: desired, version: state.version });
        setAttempt(null);
        setMessage(t(desired ? "saved" : "removed"));

    }

    return {
        t, id, saved, toggle, visible, ready, token, allowed, retry, pending: action.pending,
        loading: state.loading, refresh, expired: state.expired || action.error?.status === 401,
        disabled: !ready || action.pending || !allowed || unknown || state.loading && !retry,
        error: action.error ? Object.values(action.error.errors).flat()[0]
            || t(action.error.status === 403 ? "actionDenied" : "actionFailed")
            : state.failed ? t("stateFailed") : null,
        message,
    };

}
