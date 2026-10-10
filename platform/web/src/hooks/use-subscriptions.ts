"use client";

import { useState } from "react";
import type { Data } from "@/api/features";
import { useAction, useRead } from "@/hooks/use-operation";
import { useToast } from "@/hooks/use-toast";
import { useLocale, useTranslations } from "@/lib/providers/intl";
import { routing } from "@/lib/spec/config";
import { day, money } from "@/lib/std/format";
import { localePath } from "@/lib/std/locale";
import { useUi } from "@/stores/provider";

type Subscription = Data<"subscriptions", "list">;
type Ask = { kind: "cancel" | "pay" | "review"; id: number; name: string };

const durations = ["monthly", "yearly", "lifetime"] as const;

export type SubscriptionStatus = "active" | "unpaid" | "expired";

export function useSubscriptions ( links: { login: string; plans: string } ) {

    const t = useTranslations("subscriptions");
    const locale = useLocale();
    const toast = useToast();
    const ready = useUi(( state ) => state.ready);
    const token = useUi(( state ) => state.token);
    const list = useRead("subscriptions", "list", { limit: 30 }, { enabled: Boolean(token) });
    const renewal = useAction("subscriptions", "autoRenew");
    const cancel = useAction("subscriptions", "cancel");
    const [asked, setAsked] = useState<Ask | null>(null);
    const [toggling, setToggling] = useState<number | null>(null);
    const stamp = ( value: string | null | undefined ) => value ? day(value, locale, { dateStyle: "medium" }) : null;
    const statusOf = ( row: Subscription ): SubscriptionStatus => row.is_expired ? "expired" : row.started_at ? "active" : "unpaid";

    async function toggle ( id: number, value: boolean ) {

        if ( renewal.pending ) return;

        setToggling(id);

        const result = await renewal.run({ subscriptionId: id, auto_renew: value }).catch(() => null);

        setToggling(null);
        toast(result
            ? { title: t(value ? "renewOn" : "renewOff"), tone: "success" }
            : { title: t("renewFailed"), tone: "error" });

    }
    function ask ( kind: Ask["kind"], item: { id: number; name: string } ) {

        cancel.clear();
        setAsked({ kind, id: item.id, name: item.name });

    }
    async function confirmCancel () {

        if ( !asked || cancel.pending ) return;

        const result = await cancel.run({ subscriptionId: asked.id });

        if ( !result ) return;

        toast({ title: t("cancelled", { plan: asked.name }), tone: "success" });
        setAsked(null);
        list.reload();

    }

    return {
        t, ready, token, asked, setAsked, ask, toggle, confirmCancel, toggling,
        login: `${localePath(locale, links.login, routing)}?${new URLSearchParams({ next: "/subscriptions" })}`,
        plans: localePath(locale, links.plans, routing),
        loading: list.loading && !list.data,
        failed: Boolean(list.error),
        reload: list.reload,
        cancelling: cancel.pending,
        cancelError: cancel.error ? Object.values(cancel.error.errors).flat()[0] || t("cancelFailed") : null,
        items: (list.data ?? []).map(( row ) => {

            const status = statusOf(row);
            const duration = durations.find(( entry ) => entry === row.duration);

            return {
                id: row.id,
                name: row.plan?.name || t("unnamed"),
                status,
                workspace: row.workspace?.name ?? null,
                host: row.workspace?.host ?? null,
                duration: duration ? t(`durations.${duration}`) : null,
                price: money(row.price, locale, "USD") ?? null,
                started: stamp(row.started_at),
                expires: duration === "lifetime" ? null : stamp(row.expires_at),
                autoRenew: row.auto_renew === true,
                renewable: status === "active" && duration !== "lifetime",
                payable: status === "unpaid",
                cancellable: status !== "expired",
                reviewable: status === "active",
            };

        }),
    };

}
