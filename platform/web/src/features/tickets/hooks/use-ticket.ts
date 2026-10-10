"use client";

import type { Route } from "next";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useFormFields } from "@/hooks/use-form-fields";
import { useAction, useRead } from "@/hooks/use-operation";
import { useToast } from "@/hooks/use-toast";
import { useLocale, useTranslations } from "@/lib/providers/intl";
import { routing } from "@/lib/spec/config";
import { day } from "@/lib/std/format";
import { localePath } from "@/lib/std/locale";
import { entityId, fillPattern } from "@/lib/std/route";
import { initials } from "@/lib/std/text";
import { useUi } from "@/stores/provider";
import { ticketTone } from "./use-tickets";

type Links = { login: string; list: string; order: string };

export function useTicket ( id: string | undefined, links: Links ) {

    const t = useTranslations("support");
    const locale = useLocale();
    const path = usePathname();
    const router = useRouter();
    const toast = useToast();
    const ready = useUi(( state ) => state.ready);
    const token = useUi(( state ) => state.token);
    const me = useUi(( state ) => state.user);
    const ticketId = entityId(id) ?? 0;
    const view = useRead("tickets", "view", { ticketId }, { enabled: ready && Boolean(token) && ticketId > 0 });
    const replies = useRead("tickets", "replies", { ticketId, page: 1, limit: 100 }, { enabled: ready && Boolean(token) && ticketId > 0 });
    const reply = useAction("tickets", "reply");
    const close = useAction("tickets", "close");
    const resolve = useAction("tickets", "resolve");
    const reopen = useAction("tickets", "reopen");
    const remove = useAction("tickets", "delete");
    const restore = useAction("tickets", "restore");
    const [busy, setBusy] = useState(false);
    const [editing, setEditing] = useState<{ title: string; content: string } | null>(null);
    const form = useFormFields({
        initial: { title: "", content: "" }, failure: reply.error, clear: reply.clear,
        validate: ( values ): Record<string, string> => !values.content.trim() ? { content: t("contentShort") } : {},
    });
    const ticket = view.data;
    const stamp = ( value: string | null | undefined ) => value ? day(value, locale, { dateStyle: "medium", timeStyle: "short" }) : null;
    const list = localePath(locale, links.list, routing);

    async function send () {

        if ( !form.check() ) return;

        const answer = await reply.run({ ticketId, content: form.values.content.trim() });

        if ( !answer ) return;

        form.reset({ title: "", content: "" });
        replies.reload();
        view.reload();

    }
    async function change ( action: "close" | "resolve" | "reopen" ) {

        setBusy(true);

        try {

            const answer = await (action === "close" ? close : action === "resolve" ? resolve : reopen).run({ ticketId });

            if ( answer ) toast({ title: t(`done.${action}`), tone: "success" });

        }
        finally { setBusy(false); view.reload(); }

    }
    async function discard () {

        setBusy(true);

        try {

            const answer = await remove.run({ ticketId });

            if ( !answer ) return;

            toast({
                title: t("deleted"), tone: "info",
                action: { label: t("undo"), onClick: () => { void restore.run({ ticketId }).then(() => router.push(path as Route)); } },
            });
            router.push(list as Route);

        }
        finally { setBusy(false); }

    }

    const author = ticket?.user?.name || me?.name || t("you");
    const rows = [
        ...(ticket?.content ? [{
            key: "opening", mine: true, author, image: ticket.user?.image ?? me?.image ?? null,
            text: ticket.content, time: stamp(ticket.created_at),
        }] : []),
        ...(replies.data ?? ticket?.replies ?? []).map(( row ) => {

            const mine = Boolean(row.user?.id && (row.user.id === ticket?.user?.id || row.user.id === me?.id));

            return {
                key: String(row.id), mine, author: row.user?.name || t(mine ? "you" : "team"), image: row.user?.image ?? null,
                text: row.content ?? "", time: stamp(row.created_at),
            };

        }),
    ].map(( row ) => ({ ...row, initials: initials(row.author) }));
    const state = ticket?.status === "resolved" || ticket?.status === "closed" ? ticket.status : "pending";

    return {
        t, ready, token, form, send, change, discard, rows, ticketId, editing, setEditing,
        edit: () => setEditing(ticket ? { title: ticket.title ?? "", content: ticket.content ?? "" } : null),
        edited: () => { setEditing(null); view.reload(); },
        login: `${localePath(locale, links.login, routing)}?${new URLSearchParams({ next: path })}`,
        back: { href: list, label: t("back") },
        loading: view.loading && !ticket,
        failed: Boolean(view.error),
        missing: view.error?.status === 404 || ticketId === 0,
        reload: () => { view.reload(); replies.reload(); },
        pending: reply.pending,
        busy: busy || close.pending || resolve.pending || reopen.pending || remove.pending,
        error: reply.error ? Object.values(reply.error.errors).flat()[0] || t("failed") : null,
        ticket: ticket ? {
            id: ticket.id,
            title: ticket.title || t("untitled"),
            status: { label: t(`states.${state}`), tone: ticketTone(ticket.status) },
            facts: [
                stamp(ticket.created_at) ? t("opened", { date: stamp(ticket.created_at) ?? "" }) : null,
                ticket.assignee?.name ? t("assignee", { name: ticket.assignee.name }) : null,
            ].filter(( value ): value is string => Boolean(value)),
            order: ticket.order ? {
                label: t("about", { reference: ticket.order.reference || `#${ticket.order.id}` }),
                href: localePath(locale, fillPattern(links.order, { orderId: String(ticket.order.id) }), routing),
            } : null,
            open: state === "pending",
        } : null,
    };

}
