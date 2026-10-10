"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { Data } from "@/api/features";
import { useCartMutation } from "@/hooks/use-cart-mutation";
import { useRead } from "@/hooks/use-operation";
import { useLocale } from "@/lib/providers/intl";
import { entityLink } from "@/lib/spec/browser";
import { routing } from "@/lib/spec/config";
import { localePath } from "@/lib/std/locale";
import { useUi } from "@/stores/provider";
import type { CheckoutLinks } from "./use-checkout-route";
import { useOrderAttempt } from "./use-order-attempt";

type Loaded = { item: Data<"cart", "view">; purchase: Data<"products", "order"> };
type Snapshot = { key: string; data: Loaded };

export function useCartCheckout ( id: number | undefined, links: CheckoutLinks ) {

    const ready = useUi(( state ) => state.ready);
    const token = useUi(( state ) => state.token);
    const user = useUi(( state ) => state.user);
    const locale = useLocale();
    const pathname = usePathname();
    const search = useSearchParams();
    const key = [user?.id ?? "guest", id].join(".");
    const action = useOrderAttempt<"checkout" | "cart">("cart", id ?? 0);
    const preparation = useCartMutation(["checkout", id ?? 0].join("."));
    const readable = !!user?.permissions?.includes("view_carts");
    const line = useRead("cart", "view", { cartId: id ?? 0 }, { enabled: ready && !!token && !!id && readable });
    const productId = line.data?.catalog?.id;
    const product = useRead("products", "order", { productId: productId ?? 0 }, {
        enabled: ready && !!token && !!productId && readable,
    });
    const fresh = useMemo(() => line.data && product.data && product.data.product.id === productId
        ? { item: line.data, purchase: product.data } : null, [line.data, product.data, productId]);
    const [kept, setKept] = useState<Snapshot | null>(null);

    useEffect(() => { if ( fresh ) setKept({ key, data: fresh }); }, [fresh, key]);

    const data = fresh ?? (kept?.key === key ? kept.data : null);
    const path = data ? entityLink("product", data.purchase.product) : null;
    const error = line.error ?? product.error;
    const pending = line.loading || product.loading;

    return {
        ready, token, user, action, preparation, data, error, pending, query: search.toString(),
        disabled: !fresh || pending || !!error,
        productHref: path ? localePath(locale, path, routing) : null,
        unavailable: line.error?.status === 404 || line.error?.status === 410 || !!line.data && !line.data.catalog,
        back: localePath(locale, links.cart ?? "/cart", routing),
        login: `${localePath(locale, links.login, routing)}?${new URLSearchParams({
            next: `${pathname}${search.size ? `?${search}` : ""}`,
        })}`,
        reload: () => { line.reload(); product.reload(); },
    };

}
