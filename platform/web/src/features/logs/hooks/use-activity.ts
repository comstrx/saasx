"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useState } from "react";
import type { ActivityTarget } from "@/hooks/use-activity-details";
import { useAction, useRead } from "@/hooks/use-operation";
import { useToast } from "@/hooks/use-toast";
import { useTrash } from "@/hooks/use-trash";
import { useLocale, useTranslations } from "@/lib/providers/intl";
import { routing } from "@/lib/spec/config";
import { agentOf } from "@/lib/std/agent";
import { day, dayBucket } from "@/lib/std/format";
import { localePath } from "@/lib/std/locale";
import { useUi } from "@/stores/provider";

const views = ["log", "comments", "reports"] as const;
const size = 20;
const audits = [
    "login", "logout", "registered", "otp_sent", "password_changed", "password_reset", "recovery_requested", "email_confirmed",
    "email_change_requested", "phone_change_requested", "social_login", "social_attached", "deactivated", "reactivated",
    "deletion_requested",
] as const;
const changes = ["created", "updated", "deleted", "restored"] as const;
const entities = {
    user: "user", order: "receipt", cart: "bag", ticket: "support", reply: "support", room: "chat", message: "chat", favorite: "heart",
    review: "star", comment: "chat", report: "flag", transaction: "wallet", payment: "card", wallet: "wallet",
} as const;
const kinds = Object.keys(entities) as (keyof typeof entities)[];
const numbered = new Set(["order", "ticket"]);

type Entry = {
    key: string; title: string; body: string | null; time: string | null; icon: string; day: { key: string; title: string };
    edit?: { kind: "comment" | "report"; id: number; content: string }; status?: string | null; open?: ActivityTarget;
};

function known<T extends string> ( list: readonly T[], value: string | null | undefined ): value is T {

    return Boolean(value) && (list as readonly string[]).includes(value as string);

}
function grouped ( items: readonly Entry[] ) {

    const groups = new Map<string, { key: string; title: string; items: Entry[] }>();

    for ( const item of items ) {

        const group = groups.get(item.day.key) ?? { ...item.day, items: [] };

        group.items.push(item);
        groups.set(item.day.key, group);

    }

    return [...groups.values()];

}
export function useActivity ( login: string ) {

    const t = useTranslations("activity");
    const locale = useLocale();
    const path = usePathname();
    const search = useSearchParams();
    const toast = useToast();
    const ready = useUi(( state ) => state.ready);
    const token = useUi(( state ) => state.token);
    const signed = ready && Boolean(token);
    const view = views.find(( value ) => value === search.get("view")) ?? "log";
    const [limit, setLimit] = useState(size);
    const [editing, setEditing] = useState<{ kind: "comment" | "report"; id: number; content: string } | null>(null);
    const [opened, setOpened] = useState<{ kind: "log" | "report" | "comment"; id: number; title: string } | null>(null);
    const log = useRead("logs", "list", { page: 1, limit, sort: "newest" }, { enabled: signed && view === "log" });
    const comments = useRead("comments", "list", { page: 1, limit, sort: "newest" }, { enabled: signed && view === "comments" });
    const reports = useRead("reports", "list", { page: 1, limit, sort: "newest" }, { enabled: signed && view === "reports" });
    const updateComment = useAction("comments", "update");
    const updateReport = useAction("reports", "update");
    const active = view === "log" ? log : view === "comments" ? comments : reports;
    const commentTrash = useTrash("comments", comments.reload);
    const reportTrash = useTrash("reports", reports.reload);
    const trash = view === "comments" ? commentTrash : view === "reports" ? reportTrash : null;
    const total = active.meta?.pagination?.total;
    const shown = active.data?.length ?? 0;
    const [now] = useState(() => Date.now());
    const stamp = ( value: string | null | undefined ) => value ? day(value, locale, { timeStyle: "short" }) : null;
    const dated = ( value: string | null | undefined ) => {

        if ( !value ) return { key: "undated", title: t("undated") };

        const bucket = dayBucket(value, now);

        return bucket === "earlier"
            ? { key: value.slice(0, 10), title: day(value, locale, { weekday: "long", day: "numeric", month: "long", year: "numeric" }) }
            : { key: bucket, title: t(bucket) };

    };

    async function save () {

        if ( !editing?.content.trim() ) return;

        const answer = editing.kind === "comment"
            ? await updateComment.run({ commentId: editing.id, content: editing.content.trim() })
            : await updateReport.run({ reportId: editing.id, content: editing.content.trim() });

        if ( !answer ) {

            toast({ title: t("failed"), tone: "error" });
            return;

        }

        setEditing(null);
        toast({ title: t("saved"), tone: "success" });
        active.reload();

    }
    function remove ( kind: "comment" | "report", id: number ) {

        void (kind === "comment" ? commentTrash : reportTrash).hide(id);

    }

    return {
        t, ready, token, view, editing, setEditing, save, remove, opened, setOpened,
        login: `${localePath(locale, login, routing)}?${new URLSearchParams({ next: path })}`,
        busy: updateComment.pending || updateReport.pending || commentTrash.pending || reportTrash.pending,
        selection: trash ? { ids: trash.selection.ids, pick: trash.selection.pick, label: trash.selection.labels.select } : null,
        bulk: trash?.selection.ids.length ? {
            count: trash.selection.labels.count, clear: trash.selection.labels.clear, busy: trash.pending, onClear: trash.selection.clear,
            actions: [{
                key: "remove", label: trash.selection.labels.remove, icon: "trash" as const, danger: true,
                onSelect: () => { void trash.hideSelected(); },
            }],
        } : null,
        loading: active.loading && !active.data,
        failed: Boolean(active.error),
        reload: active.reload,
        tabs: views.map(( value ) => ({
            value, label: t(`tabs.${value}`), href: value === "log" ? path : `${path}?${new URLSearchParams({ view: value })}`,
        })),
        more: total != null && shown < total ? () => setLimit(( value ) => value + size) : null,
        groups: grouped(view === "log" ? (log.data ?? []).map(( row ) => {

            const agent = agentOf(row.agent);
            const device = agent ? t("device", { browser: agent.browser, system: agent.system }) : null;
            const entity = known(kinds, row.entity) ? row.entity : null;
            const noun = entity ? t(`entities.${entity}`) : null;
            const title = known(audits, row.event) ? t(`audits.${row.event}`)
                : noun && entity && numbered.has(entity) && row.element_id ? t("entry", { entity: noun, id: row.element_id })
                : noun ?? t("event");

            return {
                key: String(row.id),
                title,
                body: [known(changes, row.event) ? t(`changes.${row.event}`) : null, device, row.ip].filter(Boolean).join(" · ") || null,
                time: stamp(row.created_at),
                icon: known(audits, row.event) ? "shield" : entity ? entities[entity] : "dots",
                open: { kind: "log" as const, id: row.id, title },
                day: dated(row.created_at),
            };

        }) : view === "comments" ? (comments.data ?? []).map(( row ) => ({
            key: String(row.id),
            title: row.related?.title || row.related?.name || t("comment"),
            body: row.content ?? null,
            time: stamp(row.created_at),
            icon: "chat",
            edit: { kind: "comment" as const, id: row.id, content: row.content ?? "" },
            open: { kind: "comment" as const, id: row.id, title: row.related?.title || row.related?.name || t("comment") },
            day: dated(row.created_at),
        })) : (reports.data ?? []).map(( row ) => ({
            key: String(row.id),
            title: row.title || row.reason || t("report"),
            body: row.content ?? null,
            time: stamp(row.created_at),
            icon: "flag",
            status: row.status ?? null,
            edit: { kind: "report" as const, id: row.id, content: row.content ?? "" },
            open: { kind: "report" as const, id: row.id, title: row.title || row.reason || t("report") },
            day: dated(row.created_at),
        }))),
    };

}
