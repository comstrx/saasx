"use client";

import { useRead } from "@/hooks/use-operation";
import { useLocale, useTranslations } from "@/lib/providers/intl";
import { agentOf } from "@/lib/std/agent";
import { day } from "@/lib/std/format";

export type ActivityTarget = { kind: "log" | "report" | "comment"; id: number; title: string };

function shown ( value: unknown ): string {

    if ( value == null || value === "" ) return "—";
    if ( typeof value === "string" || typeof value === "number" || typeof value === "boolean" ) return String(value);

    return JSON.stringify(value).slice(0, 160);

}
export function useActivityDetails ( target: ActivityTarget | null ) {

    const t = useTranslations("activity");
    const locale = useLocale();
    const log = useRead("logs", "view", { logId: target?.id ?? 0 }, { enabled: target?.kind === "log" });
    const report = useRead("reports", "view", { reportId: target?.id ?? 0 }, { enabled: target?.kind === "report" });
    const comment = useRead("comments", "view", { commentId: target?.id ?? 0 }, { enabled: target?.kind === "comment" });
    const row = target?.kind === "report" ? report.data : target?.kind === "comment" ? null : log.data;
    const request = target?.kind === "report" ? report : target?.kind === "comment" ? comment : log;
    const commentRow = target?.kind === "comment" ? comment.data : null;
    const agent = agentOf(row?.agent ?? null);
    const device = agent ? t("device", { browser: agent.browser, system: agent.system }) : null;
    const created = row?.created_at ?? commentRow?.created_at;
    const stamp = created ? day(created, locale, { dateStyle: "medium", timeStyle: "short" }) : null;
    const logRow = target?.kind === "log" ? log.data : null;
    const reportRow = target?.kind === "report" ? report.data : null;
    const changes = logRow?.changes && !Array.isArray(logRow.changes) ? Object.entries(logRow.changes) : [];
    const facts = [
        { key: "time", term: t("detail.time"), detail: stamp, icon: "clock" },
        { key: "device", term: t("detail.device"), detail: device, icon: "devices" },
        { key: "ip", term: t("detail.ip"), detail: row?.ip ?? null, icon: "globe" },
        { key: "status", term: t("detail.status"), detail: reportRow?.status ?? null, icon: "seal" },
        { key: "reason", term: t("detail.reason"), detail: reportRow?.reason ?? null, icon: "flag" },
        { key: "likes", term: t("detail.likes"), detail: commentRow?.likes ? String(commentRow.likes) : null, icon: "thumbs-up" },
        { key: "replies", term: t("detail.replies"), detail: commentRow?.replies ? String(commentRow.replies) : null, icon: "reply" },
    ].flatMap(( fact ) => fact.detail ? [{ key: fact.key, term: fact.term, detail: fact.detail, icon: fact.icon }] : []);

    return {
        t, facts,
        title: target?.title ?? t("event"),
        body: reportRow?.content ?? commentRow?.content ?? null,
        changes: changes.map(( [field, value] ) => ({ key: field, field: field.replaceAll("_", " "), value: shown(value) })),
        loading: request.loading && !row && !commentRow,
        failed: Boolean(request.error),
        reload: request.reload,
    };

}
