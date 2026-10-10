"use client";

import { useEffect, useId, useState } from "react";
import type { Data } from "@/api/features";
import type cart from "@/api/features/cart";
import { useBusySignal } from "@/hooks/use-busy-items";
import { useCartMutation } from "@/hooks/use-cart-mutation";
import { useRead } from "@/hooks/use-operation";
import { useTranslations } from "@/lib/providers/intl";
import type { z } from "@/lib/providers/schema";
import { useUi } from "@/stores/provider";

type Options = {
    item: Data<"cart", "view"> | null; disabled?: boolean; onClose: () => void; onBusy?: ( busy: boolean ) => void;
};

export function useCartEditor ( { item, disabled, onClose, onBusy }: Options ) {

    const t = useTranslations("cart");
    const common = useTranslations("common");
    const id = useId();
    const user = useUi(( state ) => state.user);
    const token = useUi(( state ) => state.token);
    const mutation = useCartMutation("editor");
    const allowed = !!token && user?.permissions?.includes("edit_carts") === true;
    const product = useRead("products", "order", { productId: item?.catalog?.id ?? 0 }, { enabled: allowed && !!item?.catalog?.id });
    const [message, setMessage] = useState<string | null>(null);
    const busy = !!mutation.attempt || mutation.pending || mutation.blocked;
    const locked = !!disabled || mutation.locked || !allowed;

    useBusySignal(busy, onBusy);
    useEffect(() => { if ( message ) document.getElementById(id)?.focus(); }, [message, id]);
    useEffect(() => { if ( item ) setMessage(null); }, [item]);

    async function save ( input?: z.input<typeof cart.update.input> ) {

        if ( disabled || !allowed || !mutation.attempt && !input ) return;

        const result = await mutation.run("update", input);

        if ( result ) {

            setMessage(t("detailsSaved"));
            onClose();

        }

    }
    function close () {

        if ( mutation.locked ) return;

        mutation.clear();
        onClose();

    }

    return {
        t, common, id, product, mutation, busy, locked, save, close, message, allowed,
        open: !!item || !!mutation.attempt || mutation.blocked,
        error: mutation.blocked ? t("blocked") : !allowed ? t("deniedBody") : mutation.error
            ? Object.values(mutation.error.errors).flat()[0] || t("failed") : null,
    };

}
