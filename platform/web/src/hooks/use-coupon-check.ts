"use client";

import { useState } from "react";
import { useAction } from "@/hooks/use-operation";
import { useLocale, useTranslations } from "@/lib/providers/intl";
import { money } from "@/lib/std/format";

export type CouponScope = { kind: "product"; productId: number; quantity: number } | { kind: "cart"; cartId: number };

export function useCouponCheck ( scope: CouponScope ) {

    const t = useTranslations("couponCheck");
    const locale = useLocale();
    const validate = useAction("coupons", "validate");
    const cart = useAction("cart", "coupon");
    const single = useAction("products", "coupon");
    const [checked, setChecked] = useState<{ code: string; saving: string | null } | null>(null);
    const failed = Boolean(validate.error ?? cart.error ?? single.error);
    const pending = validate.pending || cart.pending || single.pending;

    async function check ( code: string ) {

        const value = code.trim();

        if ( !value || pending ) return;

        const result = scope.kind === "cart" ? await cart.run({ cartId: scope.cartId, code: value })
            : scope.quantity > 1 ? await validate.run({ code: value, productId: scope.productId, quantity: scope.quantity })
            : await single.run({ productId: scope.productId, code: value });

        if ( !result ) {

            setChecked(null);
            return;

        }

        const found = money(result.resource.discount, locale);
        const saving = found ? found.before ? `${found.currency} ${found.number}` : `${found.number} ${found.currency}` : null;

        setChecked({ code: value, saving });

    }
    function reset () {

        validate.clear();
        cart.clear();
        single.clear();
        setChecked(null);

    }

    return {
        check, reset, checked,
        pending,
        message: !checked ? null : checked.saving
            ? t("saving", { code: checked.code, amount: `\u2068${checked.saving}\u2069` }) : t("valid", { code: checked.code }),
        error: failed ? t("invalid") : null,
        apply: t("apply"),
    };

}
