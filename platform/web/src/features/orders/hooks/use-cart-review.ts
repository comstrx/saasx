"use client";

import { useState } from "react";
import type { Data } from "@/api/features";
import type { CartReview, CartReviewInput } from "@/hooks/use-cart-purchase";
import { useTranslations } from "@/lib/providers/intl";
import type { Review } from "./use-checkout-form";

export type GroupReview = { review?: CartReview; back: string; save: ( value: CartReviewInput ) => boolean };
type Option = NonNullable<Data<"orders", "preview">["payment_options"]>[number];

export function useCartReview (
    group: GroupReview | undefined, product: Data<"products", "order">["product"],
    review: Review | null, values: Record<string, string>, method: string, option: Option | undefined, cartId?: number,
) {

    const [failed, setFailed] = useState(false);
    const t = useTranslations("cartPurchase");

    function save () {

        if ( !group || !review || !option || !cartId || !["wallet", "later"].includes(method) ) return;

        const { productId, ...booking } = review.input;
        const done = group.save({
            input: {
                ...booking, ...review.contact, id: cartId, quote_token: review.quote.quote_token,
                pay_type: method === "later" ? "later" : "wallet",
                ...(method !== "later" ? { amount: String(option.due_now) } : {}),
            },
            productId, name: product.name, image: product.image ?? null,
            currency: option.currency ?? review.quote.currency ?? "",
            quote: review.quote, values, method: method === "later" ? "later" : "wallet", approved: true,
        });

        setFailed(!done);

    }

    return { save, message: failed ? t("saveFailed") : null };

}
