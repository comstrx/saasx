"use client";

import type { Route } from "next";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { ListValues } from "@/hooks/use-list-controls";
import { useRead } from "@/hooks/use-operation";
import { useOrderRecord } from "@/hooks/use-order-record";
import { useTrash } from "@/hooks/use-trash";
import { useLocale, useTranslations } from "@/lib/providers/intl";
import { routing } from "@/lib/spec/config";
import { count } from "@/lib/std/format";
import { queryHref, queryText } from "@/lib/std/listing";
import { localePath } from "@/lib/std/locale";
import { orderListInput, orderSorts, orderStates } from "@/lib/std/orders";
import { useUi } from "@/stores/provider";

type Links = { login: string; order: string; browse: string; limit: number };

export function useOrderList ( links: Links ) {

    const t = useTranslations("orders");
    const common = useTranslations("common");
    const locale = useLocale();
    const path = usePathname();
    const search = useSearchParams();
    const router = useRouter();
    const ready = useUi(( state ) => state.ready);
    const token = useUi(( state ) => state.token);
    const query = Object.fromEntries(search.entries());
    const input = orderListInput(query, links.limit);
    const request = useRead("orders", "list", input, { enabled: ready && !!token });
    const tally = useRead("orders", "list", { limit: 1, facets: ["status"] }, { enabled: ready && !!token });
    const shape = useOrderRecord(links.order);
    const trash = useTrash("orders", () => { request.reload(); tally.reload(); });
    const items = request.data?.map(( row ) => {

        const record = shape(row);

        return {
            id: row.id, ...record,
            select: {
                id: `order-select-${row.id}`, label: trash.selection.labels.select(record.reference),
                checked: trash.selection.ids.includes(row.id), onChange: ( value: boolean ) => trash.selection.pick(row.id, value),
            },
            menu: {
                label: t("actions"),
                items: [{ key: "archive", label: t("archive"), icon: "archive" as const, onSelect: () => { void trash.hide(row.id); } }],
            },
        };

    }) ?? [];
    const pagination = request.meta?.pagination;
    const page = pagination?.page ?? input.page;
    const total = pagination?.total;
    const pages = pagination?.pages;
    const hasNext = pages != null ? page < pages : items.length === input.limit;
    const status = orderStates.find(( value ) => value === queryText(query, "status")) ?? "all";
    const filtered = !!queryText(query, "query") || status !== "all";

    function apply ( values: ListValues ) {

        const href = queryHref(path, {}, { query: values.query.trim() || null, status: values.status, sort: values.sort });

        router.push(href as Route, { scroll: false });

    }

    const counts = tally.meta?.aggregates?.facets?.status ?? {};
    const sum = ( keys: readonly string[] ) => keys.reduce(( total, key ) => total + Number(counts[key] ?? 0), 0);
    const known = tally.meta?.pagination?.total;

    return {
        t, common, request, items, ready, token, filtered,
        bulk: trash.selection.ids.length ? {
            count: trash.selection.labels.count, clear: trash.selection.labels.clear, busy: trash.pending,
            onClear: trash.selection.clear,
            actions: [{
                key: "archive", label: t("archive"), icon: "archive" as const, danger: true, onSelect: () => { void trash.hideSelected(); },
            }],
        } : null,
        stats: {
            loading: tally.loading && known == null,
            label: t("statsLabel"),
            items: [
                { key: "all", label: t("filters.all"), value: known != null ? count(known, locale) : null, icon: "receipt", tone: "teal" },
                {
                    key: "active", label: t("filters.active"), icon: "calendar-check", tone: "blue",
                    value: known != null ? count(sum(["pending", "confirmed", "processing", "on_hold"]), locale) : null,
                },
                {
                    key: "completed", label: t("filters.completed"), icon: "check-circle", tone: "green",
                    value: known != null ? count(sum(["completed", "delivered"]), locale) : null,
                },
                {
                    key: "cancelled", label: t("filters.cancelled"), icon: "ban", tone: "red",
                    value: known != null ? count(sum(["cancelled", "refunded", "expired", "failed"]), locale) : null,
                },
            ] as const,
        },
        laterPage: input.page > 1,
        login: `${localePath(locale, links.login, routing)}?${new URLSearchParams({ next: `${path}?${search}` })}`,
        browse: localePath(locale, links.browse, routing), clear: path,
        denied: request.error?.status === 403, expired: request.error?.status === 401,
        controls: {
            values: { query: queryText(query, "query") ?? "", status, sort: input.sort },
            statuses: orderStates.map(( value ) => ({ value, label: t(`filters.${value}`) })),
            sorts: orderSorts.map(( value ) => ({ value, label: t(`sorts.${value}`) })),
            labels: { query: t("search"), status: t("filter"), sort: t("sort"), apply: t("apply"), clear: t("clear") },
            clear: filtered || input.sort !== "newest" ? path : undefined,
            pending: request.loading, onApply: apply,
        },
        count: total == null ? t("list") : t("count", { count: total }),
        pager: {
            label: t("page", { page: count(page, locale) }),
            previous: page > 1 ? { label: common("previous"), href: queryHref(path, query, { page: String(page - 1) }) } : null,
            next: hasNext ? { label: common("next"), href: queryHref(path, query, { page: String(page + 1) }) } : null,
        },
    };

}
