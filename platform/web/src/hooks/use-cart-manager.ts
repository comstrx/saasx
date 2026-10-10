"use client";

import { useEffect, useId, useState } from "react";
import { bulk } from "@/api/core/fields";
import type { Data } from "@/api/features";
import { useCartMutation } from "@/hooks/use-cart-mutation";
import { useTranslations } from "@/lib/providers/intl";
import { useUi } from "@/stores/provider";

type Line = Data<"cart", "view">;
type Removal = { kind: "one"; item: Line } | { kind: "selected"; ids: number[] } | { kind: "all" };

export function useCartManager ( items: readonly Line[] ) {

    const t = useTranslations("cart");
    const user = useUi(( state ) => state.user);
    const token = useUi(( state ) => state.token);
    const permissions = user?.permissions ?? [];
    const mutation = useCartMutation("manage");
    const [selected, setSelected] = useState<number[]>([]);
    const [removal, setRemoval] = useState<Removal | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const id = useId();
    const chosen = selected.filter(( id ) => items.some(( item ) => item.id === id));
    const canEdit = !!token && permissions.includes("edit_carts");
    const canRemove = !!token && permissions.includes("delete_carts");

    useEffect(() => { if ( message ) document.getElementById(id)?.focus(); }, [message, id]);

    function clear () { setMessage(null); mutation.clear(); }
    function select ( target: number, checked: boolean ) {

        if ( mutation.locked ) return;

        setSelected(( values ) => checked ? [...new Set([...values, target])] : values.filter(( id ) => id !== target));

    }
    function ask ( target: Removal ) {

        if ( mutation.locked || !canRemove ) return;

        clear();
        setRemoval(target);

    }
    function close () { if ( !mutation.locked ) setRemoval(null); }
    async function finish ( result: Awaited<ReturnType<typeof mutation.run>>, action: string ) {

        if ( !result ) return;

        const many = bulk.safeParse(result.resource);
        const missed = many.success ? many.data.missed_ids ?? [] : [];

        setMessage(missed.length ? t("partialRemoval", { count: missed.length }) : t(action === "quantity" ? "quantitySaved" : "removed"));
        setRemoval(null);
        setSelected([]);

    }
    async function quantity ( item: Line, value: number ) {

        if ( mutation.locked || !canEdit ) return;

        clear();

        const operation = value > Number(item.quantity) ? "increment" : "decrement";

        await finish(await mutation.run(operation, { cartId: item.id, quantity: 1 }), "quantity");

    }
    async function remove () {

        if ( !canRemove || !removal || mutation.locked ) return;

        const input = removal.kind === "one" ? { cartId: removal.item.id }
            : removal.kind === "all" ? { all: true as const } : { ids: removal.ids };

        await finish(await mutation.run(removal.kind === "one" ? "delete" : "clear", input), "remove");

    }
    async function recover () {

        const operation = mutation.attempt?.operation;
        const allowed = operation === "delete" || operation === "clear" ? canRemove : canEdit;

        if ( !allowed ) return;

        await finish(await mutation.run(), operation === "increment" || operation === "decrement" ? "quantity" : "remove");

    }

    return {
        t, id, mutation, chosen, select, removal, ask, close, quantity, remove, recover, canEdit, canRemove, message,
        canPurchase: !!token && permissions.includes("add_orders"),
        canRecover: mutation.attempt?.operation === "delete" || mutation.attempt?.operation === "clear" ? canRemove : canEdit,
        error: mutation.blocked ? t("blocked") : mutation.error
            ? Object.values(mutation.error.errors).flat()[0] || t(mutation.error.status === 403 ? "deniedBody" : "failed") : null,
    };

}
