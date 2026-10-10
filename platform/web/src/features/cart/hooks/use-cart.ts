"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useRead } from "@/hooks/use-operation";
import { useLocale, useTranslations } from "@/lib/providers/intl";
import { routing } from "@/lib/spec/config";
import { money } from "@/lib/std/format";
import { queryHref } from "@/lib/std/listing";
import { localePath } from "@/lib/std/locale";
import { useUi } from "@/stores/provider";

export function useCart ( options: { login: string; browse: string; limit: number } ) {

    const t = useTranslations("cart");
    const common = useTranslations("common");

    const ready = useUi(( state ) => state.ready);
    const token = useUi(( state ) => state.token);
    const locale = useLocale();
    const path = usePathname();
    const search = useSearchParams();
    const asked = Number(search.get("page"));
    const page = Number.isSafeInteger(asked) && asked > 0 ? asked : 1;
    const limit = Math.max(1, Math.min(100, options.limit));
    const request = useRead("cart", "list", { page, limit }, { enabled: ready && !!token });
    const items = request.data?.items ?? [];
    const summary = request.data?.summary;
    const price = summary?.live_subtotal ?? summary?.subtotal;
    const amount = money(price, locale, "USD", true);
    const pages = request.meta?.pagination?.pages;
    const next = pages != null ? page < pages : items.length === limit;

    return {
        t, common, ready, token, request, items, summary, amount, page,
        currencyLabel: amount ? new Intl.DisplayNames([locale], { type: "currency" }).of(amount.currency) ?? amount.currency : "",
        login: `${localePath(locale, options.login, routing)}?${new URLSearchParams({ next: `${path}?${search}` })}`,
        browse: localePath(locale, options.browse, routing),
        denied: request.error?.status === 403, expired: request.error?.status === 401,
        pager: {
            label: t("page", { page }),
            previous: page > 1 ? { label: common("previous"), href: queryHref(path, {}, { page: String(page - 1) }) } : null,
            next: next ? { label: common("next"), href: queryHref(path, {}, { page: String(page + 1) }) } : null,
        },
    };

}
