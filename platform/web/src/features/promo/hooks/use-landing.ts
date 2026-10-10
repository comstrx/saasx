"use client";

import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { rememberPromotion } from "@/hooks/use-promotion-code";
import { useLocale, useTranslations } from "@/lib/providers/intl";
import { browser } from "@/lib/spec/browser";
import { routing } from "@/lib/spec/config";
import { localePath } from "@/lib/std/locale";
import { entityParam, fillPattern } from "@/lib/std/route";

const kinds: Readonly<Record<string, string>> = { catalog: "product", blog: "article", category: "category", geo: "geo", vendor: "vendor" };

function targetOf ( kind: string | undefined, item: string | undefined ): string | null {

    const entity = kind ? kinds[kind] : undefined;
    const id = Number(item);

    if ( !entity || !Number.isSafeInteger(id) || id <= 0 ) return null;

    const routes = browser.routes.filter(( route ) => route.kind === entity);
    const route = routes.find(( entry ) => !entry.types) ?? routes[0];

    return route ? fillPattern(route.path, { [route.parameter]: entityParam(id, null) }) : null;

}
export function usePromoLanding ( parameters: Readonly<Record<string, string | undefined>>, home: string ) {

    const t = useTranslations("promo");
    const locale = useLocale();
    const router = useRouter();
    const href = localePath(locale, targetOf(parameters.kind, parameters.itemId) ?? home, routing);

    useEffect(() => {

        if ( parameters.key ) rememberPromotion(parameters.key);

        const timer = window.setTimeout(() => router.replace(href as Route), 900);

        return () => window.clearTimeout(timer);

    }, [parameters.key, href, router]);

    return { title: t("title"), body: t("body"), label: t("continue"), href };

}
