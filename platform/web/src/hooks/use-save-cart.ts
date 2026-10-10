"use client";

import { useState } from "react";
import cart from "@/api/features/cart";
import { useCartMutation } from "@/hooks/use-cart-mutation";
import { useAction } from "@/hooks/use-operation";
import { useToast } from "@/hooks/use-toast";
import { useTranslations } from "@/lib/providers/intl";
import type { z } from "@/lib/providers/schema";
import { cartFacts } from "@/lib/std/cart";
import { useUi } from "@/stores/provider";

type Input = z.input<typeof cart.add.input>;

export function useSaveCart ( input: Input, validate: () => boolean, disabled?: boolean ) {

    const t = useTranslations("cart");
    const user = useUi(( state ) => state.user);
    const mutation = useCartMutation(`product.${input.productId}`);
    const discart = useAction("products", "discart");
    const toast = useToast();
    const [saved, setSaved] = useState("");
    const parsed = cart.add.input.safeParse({ productId: input.productId, ...cartFacts(input) });
    const signature = parsed.success ? JSON.stringify(parsed.data) : "";
    const allowed = user?.permissions?.includes("add_carts") === true;

    async function save () {

        if ( disabled || !allowed || !mutation.attempt && !validate() ) return;

        setSaved("");

        const result = mutation.attempt ? await mutation.run() : parsed.success ? await mutation.run("add", parsed.data) : undefined;

        if ( result ) setSaved(signature);

    }
    async function unsave () {

        if ( discart.pending ) return;

        if ( !(await discart.run({ productId: input.productId })) ) {

            toast({ title: t("failed"), tone: "error" });
            return;

        }

        setSaved("");
        toast({ title: t("unsaved"), tone: "success" });

    }

    return {
        t, mutation, saved: !!saved && saved === signature, save, unsave, removing: discart.pending, allowed,
        error: mutation.blocked ? t("blocked") : mutation.error
            ? Object.values(mutation.error.errors).flat()[0] || t("failed") : null,
    };

}
