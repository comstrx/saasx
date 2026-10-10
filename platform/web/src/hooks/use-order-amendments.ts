"use client";

import { useEffect, useState } from "react";
import type { Data } from "@/api/features";
import { useExpiry } from "@/hooks/use-expiry";
import { useRead } from "@/hooks/use-operation";
import { useOrderMutation } from "@/hooks/use-order-mutation";
import { useLocale } from "@/lib/providers/intl";
import { reviewableChanges } from "@/lib/std/amendments";
import { money } from "@/lib/std/format";
import { hasNextPage } from "@/lib/std/route";
import { useUi } from "@/stores/provider";

type Order = Data<"orders", "view">;
type Decision = "acceptAmendment" | "declineAmendment";

export function useOrderAmendments ( order: Order, reload: () => void, resultId: string ) {

    const locale = useLocale();
    const permissions = useUi(( state ) => state.user?.permissions ?? []);
    const allowed = permissions.includes("allow_amendments");
    const [page, setPage] = useState(1);
    const [editing, setEditing] = useState(false);
    const [decision, setDecision] = useState<Decision | null>(null);
    const [done, setDone] = useState<"amend" | Decision | null>(null);
    const [notes, setNotes] = useState("");
    const history = useRead("orders", "amendments", { orderId: order.id, page, limit: 5, sort: "newest" }, { enabled: allowed });
    const listed = history.data?.find(( row ) => row.id === order.amendment?.id);
    const missing = !!order.amendment?.id && !listed && !history.loading && !history.error;
    const targeted = useRead("orders", "amendments", { orderId: order.id, ids: [order.amendment?.id ?? 1], limit: 1 },
        { enabled: allowed && missing });
    const current = listed ?? targeted.data?.find(( row ) => row.id === order.amendment?.id);
    const expired = useExpiry(current?.expires_at);
    const mutation = useOrderMutation(order.id, decision ?? (editing ? "amend" : null), "amendments");
    const priced = !!current && !!money(current.total, locale, "USD", true) && !!money(current.delta, locale, "USD", true);
    const unknown = !reviewableChanges(current?.changes) || !priced;
    const canAccept = allowed && current?.status === "proposed" && current.side === "vendor"
        && !expired && !!order.amendment_token && !unknown && priced;
    const canDecline = allowed && current?.status === "proposed" && ["buyer", "vendor"].includes(current.side ?? "");
    const active = mutation.attempt?.operation;
    const recovering = !!mutation.attempt;

    useEffect(() => {

        if ( done ) document.getElementById(resultId)?.focus();

    }, [done, resultId]);

    function refresh () {

        history.reload();
        targeted.reload();
        reload();

    }
    function complete ( operation: "amend" | Decision ) {

        setEditing(false);
        setDecision(null);
        setDone(operation);
        setNotes("");
        refresh();

    }
    function choose ( next: Decision ) {

        if ( mutation.locked || next === "acceptAmendment" && !canAccept || next === "declineAmendment" && !canDecline ) return;

        mutation.clear();
        setDone(null);
        setNotes("");
        setDecision(next);

    }
    function close () {

        if ( mutation.locked ) return;

        setEditing(false);
        setDecision(null);
        mutation.clear();

    }
    async function submit () {

        if ( !decision || !current ) return;
        if ( decision === "acceptAmendment" && !canAccept || decision === "declineAmendment" && !canDecline ) return;

        const answer = await mutation.run({
            orderId: order.id, amendmentId: current.id,
            ...(decision === "acceptAmendment" ? { quote_token: order.amendment_token ?? "" } : { notes: notes.trim() }),
        });

        if ( answer ) complete(decision);

    }
    async function retry () {

        const operation = mutation.attempt?.operation;

        if ( operation !== "amend" && operation !== "acceptAmendment" && operation !== "declineAmendment" ) return;

        if ( await mutation.run() ) complete(operation);

    }

    return {
        allowed, history, targeted, current, missing, expired, unknown, canAccept, canDecline,
        page, setPage, hasNext: hasNextPage(history.meta?.pagination, history.data?.length ?? 0, 5),
        editing, decision, done, notes, setNotes, mutation, active, recovering, choose, close, submit, retry, complete, refresh,
        edit: () => {

            if ( mutation.locked || !allowed || !order.can_amend ) return;

            setDone(null);
            setEditing(true);
            mutation.clear();

        },
    };

}
