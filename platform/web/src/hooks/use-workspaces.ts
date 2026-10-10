"use client";

import { useState } from "react";
import type { Data } from "@/api/features";
import { useAuthError } from "@/hooks/use-auth-error";
import { useAction, useRead } from "@/hooks/use-operation";
import { useToast } from "@/hooks/use-toast";
import { useLocale, useTranslations } from "@/lib/providers/intl";
import { routing } from "@/lib/spec/config";
import { day } from "@/lib/std/format";
import { localePath } from "@/lib/std/locale";
import { useUi } from "@/stores/provider";

type Tenant = Data<"tenants", "list">;
type Ask = { kind: "renew" | "delete" | "edit" | "bulk"; id: number; name: string };

export type WorkspaceStatus = "active" | "unpaid" | "expired";

function statusOf ( row: Tenant ): WorkspaceStatus {

    const plan = row.subscription;

    return !plan ? "unpaid" : plan.is_expired ? "expired" : plan.started_at ? "active" : "unpaid";

}
export function useWorkspaces ( links: { login: string; create: string; plans: string } ) {

    const t = useTranslations("workspaces");
    const locale = useLocale();
    const toast = useToast();
    const ready = useUi(( state ) => state.ready);
    const token = useUi(( state ) => state.token);
    const list = useRead("tenants", "list", { limit: 30 }, { enabled: Boolean(token) });
    const renew = useAction("tenants", "renew");
    const remove = useAction("tenants", "delete");
    const removeMany = useAction("tenants", "deleteMany");
    const [asked, setAsked] = useState<Ask | null>(null);
    const [selected, setSelected] = useState<number[]>([]);
    const action = asked?.kind === "renew" ? renew : asked?.kind === "bulk" ? removeMany : remove;
    const failure = useAuthError(action.error);
    const rows = list.data ?? [];

    function ask ( kind: Ask["kind"], item: { id: number; name: string } ) {

        renew.clear();
        remove.clear();
        removeMany.clear();
        setAsked({ kind, id: item.id, name: item.name });

    }
    function pick ( id: number, value: boolean ) {

        setSelected(( current ) => value ? [...new Set([...current, id])] : current.filter(( entry ) => entry !== id));

    }
    async function confirm () {

        if ( !asked || action.pending ) return;

        if ( asked.kind === "renew" ) {

            const result = await renew.run({
                tenantId: asked.id, redirect_url: window.location.href, failed_url: window.location.href,
            });

            if ( !result ) return;

            const target = result.resource.payment?.data?.pay_url || result.resource.payment?.data?.pay_data?.pay_url;

            if ( target && /^https?:\/\//.test(target) ) {

                window.location.assign(target);
                return;

            }

            toast({ title: t("renewed", { name: asked.name }), tone: "success" });

        }
        else if ( asked.kind === "bulk" ) {

            if ( !(await removeMany.run({ ids: selected })) ) return;

            toast({ title: t("deletedMany", { count: selected.length }), tone: "success" });
            setSelected([]);

        }
        else {

            if ( !(await remove.run({ tenantId: asked.id })) ) return;

            toast({ title: t("deleted", { name: asked.name }), tone: "success" });

        }

        setAsked(null);
        list.reload();

    }

    return {
        t, ready, token, asked, ask, close: () => { if ( !action.pending ) setAsked(null); }, confirm, selected, pick,
        clearSelection: () => setSelected([]),
        login: `${localePath(locale, links.login, routing)}?${new URLSearchParams({ next: "/workspaces" })}`,
        create: localePath(locale, links.create, routing),
        plans: localePath(locale, links.plans, routing),
        loading: list.loading && !list.data,
        failed: Boolean(list.error),
        reload: list.reload,
        pending: action.pending,
        error: failure,
        items: rows.map(( row ) => {

            const status = statusOf(row);

            return {
                id: row.id,
                name: row.name || t("unnamed"),
                host: row.host ?? null,
                href: row.host ? `https://${row.host}` : null,
                image: row.image ?? null,
                plan: row.plan?.name ?? row.subscription?.plan?.name ?? null,
                status,
                expires: row.subscription?.expires_at ? day(row.subscription.expires_at, locale, { dateStyle: "medium" }) : null,
                email: row.email ?? null,
                phone: row.phone ?? null,
            };

        }),
    };

}
