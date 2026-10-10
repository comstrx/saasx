"use client";

import type { Route } from "next";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useFormFields } from "@/hooks/use-form-fields";
import { useAction, useRead } from "@/hooks/use-operation";
import { useToast } from "@/hooks/use-toast";
import { useLocale, useTranslations } from "@/lib/providers/intl";
import { routing } from "@/lib/spec/config";
import { ago } from "@/lib/std/format";
import { localePath } from "@/lib/std/locale";
import { fillPattern } from "@/lib/std/route";
import { useUi } from "@/stores/provider";

const filters = ["all", "pending", "resolved", "closed"] as const;
const size = 15;

type Links = { login: string; thread: string };

export function ticketTone ( status: string | null | undefined ): "teal" | "ember" | "neutral" {

    return status === "resolved" ? "teal" : status === "closed" ? "neutral" : "ember";

}
export function useTickets ( links: Links ) {

    const t = useTranslations("support");
    const locale = useLocale();
    const path = usePathname();
    const search = useSearchParams();
    const router = useRouter();
    const ready = useUi(( state ) => state.ready);
    const token = useUi(( state ) => state.token);
    const asked = search.get("status");
    const status = filters.find(( value ) => value === asked) ?? "all";
    const [limit, setLimit] = useState(size);
    const [composing, setComposing] = useState(false);
    const [now] = useState(() => Date.now());
    const list = useRead("tickets", "list", { page: 1, limit, ...(status === "all" ? {} : { status }) }, {
        enabled: ready && Boolean(token),
    });
    const create = useAction("tickets", "create");
    const removeMany = useAction("tickets", "removeMany");
    const restoreMany = useAction("tickets", "restoreMany");
    const toast = useToast();
    const [selected, setSelected] = useState<number[]>([]);
    const form = useFormFields({
        initial: { title: "", content: "" }, failure: create.error, clear: create.clear,
        validate: ( values ): Record<string, string> => ({
            ...(values.title.trim().length < 2 ? { title: t("titleShort") } : {}),
            ...(values.content.trim().length < 5 ? { content: t("contentShort") } : {}),
        }),
    });
    const thread = ( id: number ) => localePath(locale, fillPattern(links.thread, { ticketId: String(id) }), routing);
    const total = list.meta?.pagination?.total;
    const shown = list.data?.length ?? 0;

    async function submit () {

        if ( !form.check() ) return;

        const answer = await create.run({ title: form.values.title.trim(), content: form.values.content.trim() });

        if ( !answer ) return;

        form.reset({ title: "", content: "" });
        setComposing(false);
        router.push(thread(answer.resource.id) as Route);

    }
    async function removeSelected () {

        const ids = [...selected];

        if ( !ids.length || removeMany.pending ) return;

        const answer = await removeMany.run({ ids });

        if ( !answer ) {

            toast({ title: t("failed"), tone: "error" });
            return;

        }

        setSelected([]);
        list.reload();
        toast({
            title: t("removedMany", { count: ids.length }), tone: "success",
            action: {
                label: t("undo"),
                onClick: () => { void restoreMany.run({ ids }).then(( back ) => { if ( back ) list.reload(); }); },
            },
        });

    }

    return {
        t, ready, token, status, form, submit, composing, setComposing,
        selection: {
            ids: selected, pending: removeMany.pending,
            toggle: ( id: number, value: boolean ) => setSelected(( current ) => (
                value ? [...new Set([...current, id])] : current.filter(( entry ) => entry !== id)
            )),
            clear: () => setSelected([]),
            remove: () => { void removeSelected(); },
            labels: {
                select: ( title: string ) => t("select", { title }), count: t("selected", { count: selected.length }),
                remove: t("removeSelected"), clear: t("clearSelection"),
            },
        },
        login: `${localePath(locale, links.login, routing)}?${new URLSearchParams({ next: path })}`,
        pending: create.pending,
        error: create.error ? Object.values(create.error.errors).flat()[0] || t("failed") : null,
        loading: list.loading && !list.data,
        failed: Boolean(list.error),
        reload: list.reload,
        tabs: filters.map(( value ) => ({
            value, label: t(`filters.${value}`), href: value === "all" ? path : `${path}?${new URLSearchParams({ status: value })}`,
        })),
        items: (list.data ?? []).map(( ticket ) => ({
            id: ticket.id,
            key: String(ticket.id),
            title: ticket.title || t("untitled"),
            body: ticket.content ?? null,
            href: thread(ticket.id),
            status: {
                label: t(`states.${ticket.status === "resolved" || ticket.status === "closed" ? ticket.status : "pending"}`),
                tone: ticketTone(ticket.status),
            },
            when: ticket.updated_at ?? ticket.created_at ? ago(ticket.updated_at ?? ticket.created_at ?? "", locale, now) : null,
            order: ticket.order?.reference || (ticket.order ? `#${ticket.order.id}` : null),
            replies: ticket.replies?.length ?? 0,
        })),
        more: total != null && shown < total ? () => setLimit(( value ) => value + size) : null,
    };

}
