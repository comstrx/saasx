"use client";

import { useEffect, useId, useState } from "react";
import type { Data } from "@/api/features";
import { useAuthError } from "@/hooks/use-auth-error";
import { useAction, useRead } from "@/hooks/use-operation";
import { useToast } from "@/hooks/use-toast";
import { useTranslations } from "@/lib/providers/intl";
import { agentOf } from "@/lib/std/agent";
import { useUi } from "@/stores/provider";

type Entry = Data<"sessions", "view">;
type Removal = { kind: "one"; item: Entry } | { kind: "others" } | { kind: "all" } | { kind: "many"; ids: number[] };

export function useSessionManager () {

    const t = useTranslations("accountSecurity");
    const id = useId();
    const request = useRead("sessions", "list");
    const one = useAction("sessions", "revoke");
    const others = useAction("sessions", "revokeOthers");
    const everywhere = useAction("account", "logoutAll");
    const many = useAction("sessions", "revokeMany");
    const current = useAction("sessions", "revokeCurrent");
    const renew = useAction("sessions", "refresh");
    const [inspected, setInspected] = useState<number | null>(null);
    const [renewing, setRenewing] = useState(false);
    const detail = useRead("sessions", "view", { sessionId: inspected ?? 0 }, { enabled: inspected != null });
    const user = useUi(( state ) => state.user);
    const profile = useUi(( state ) => state.profile);
    const toast = useToast();
    const [selected, setSelected] = useState<number[]>([]);
    const session = useUi(( state ) => state.session);
    const [removal, setRemoval] = useState<Removal | null>(null);
    const [notice, setNotice] = useState("");
    const own = removal?.kind === "one" && removal.item.is_me === true;
    const action = removal?.kind === "others" ? others : removal?.kind === "all" ? everywhere : removal?.kind === "many" ? many
        : own ? current : one;
    const pending = one.pending || others.pending || everywhere.pending || many.pending || current.pending || renew.pending;
    const error = useAuthError(action.error);
    const items = request.data ?? [];

    useEffect(() => {

        if ( notice ) document.getElementById(id)?.focus();

    }, [notice, id]);

    function ask ( choice: Removal ) {

        if ( pending ) return;

        one.clear();
        others.clear();
        everywhere.clear();
        many.clear();
        setNotice("");
        setRemoval(choice);

    }
    function close () {

        if ( pending ) return;

        setRemoval(null);
        one.clear();
        others.clear();
        everywhere.clear();
        many.clear();

    }
    async function remove () {

        if ( pending || !removal ) return;

        const result = removal.kind === "others" ? await others.run({})
            : removal.kind === "all" ? await everywhere.run({})
            : removal.kind === "many" ? await many.run({ ids: removal.ids })
            : removal.item.is_me ? await current.run({}) : await one.run({ sessionId: removal.item.id });

        if ( !result ) return;
        if ( removal.kind === "all" || (removal.kind === "one" && removal.item.is_me) ) session(null, null);

        setRemoval(null);
        setSelected([]);
        setNotice(t("sessionsRemoved"));

    }
    async function extend () {

        if ( pending || !user ) return;

        const answer = await renew.run({});

        if ( !answer ) {

            toast({ title: t("renewFailed"), tone: "error" });
            return;

        }

        setRenewing(false);
        profile(answer.resource.token, user);
        request.reload();
        toast({ title: t("renewed"), tone: "success" });

    }
    function device ( item: Entry ) {

        const agent = agentOf(item.agent ?? item.name);

        return {
            label: agent ? t("deviceOn", { browser: agent.browser, system: agent.system }) : item.name || t("unknownDevice"),
            icon: agent?.kind === "phone" ? "phone" : "devices",
        } as const;

    }

    return {
        t, id, request, items, removal, pending, error, notice, ask, close, remove, device, selected, extend,
        renewing, askRenew: () => setRenewing(true), cancelRenew: () => setRenewing(renew.pending),
        extending: renew.pending,
        inspected, inspect: setInspected,
        detail: { data: detail.data, loading: detail.loading && !detail.data, failed: Boolean(detail.error), reload: detail.reload },
        pick: ( sessionId: number, value: boolean ) => setSelected(( current ) => (
            value ? [...new Set([...current, sessionId])] : current.filter(( entry ) => entry !== sessionId)
        )),
        others: items.some(( item ) => item.is_me === false),
    };

}
