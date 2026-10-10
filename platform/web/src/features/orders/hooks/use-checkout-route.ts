"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useRead } from "@/hooks/use-operation";
import { useLocale } from "@/lib/providers/intl";
import { entityLink } from "@/lib/spec/browser";
import { routing } from "@/lib/spec/config";
import { localePath } from "@/lib/std/locale";
import { useUi } from "@/stores/provider";

export type CheckoutLinks = {
    login: string; order: string; list?: string; cart?: string; group?: string; art: string; success?: string; messages?: string;
    ticket?: string;
};

export function useCheckoutRoute ( id: number | undefined, links: CheckoutLinks ) {

    const ready = useUi(( state ) => state.ready);
    const token = useUi(( state ) => state.token);
    const user = useUi(( state ) => state.user);
    const locale = useLocale();
    const pathname = usePathname();
    const query = useSearchParams();
    const next = `${pathname}${query.size ? `?${query}` : ""}`;
    const login = `${localePath(locale, links.login, routing)}?${new URLSearchParams({ next })}`;
    const request = useRead("products", "order", { productId: id ?? 0 }, { enabled: !!id && ready && !!token });
    const path = request.data ? entityLink("product", request.data.product) : null;

    return {
        ...request, ready, token, user, locale, login, query: query.toString(),
        back: path ? `${localePath(locale, path, routing)}${query.size ? `?${query}` : ""}#booking` : null,
    };

}
