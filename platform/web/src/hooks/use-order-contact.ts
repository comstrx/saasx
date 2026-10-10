"use client";

import { useState } from "react";
import type { Data } from "@/api/features";
import { useFormFields } from "@/hooks/use-form-fields";
import { useAction } from "@/hooks/use-operation";
import { useToast } from "@/hooks/use-toast";
import { useTranslations } from "@/lib/providers/intl";

type Order = Data<"orders", "view">;

const closed = new Set(["completed", "delivered", "cancelled", "canceled", "refunded", "failed", "expired", "returned"]);
const keys = ["email", "phone", "language", "country", "city", "address", "notes"] as const;

function valuesOf ( order: Order ) {

    return Object.fromEntries(keys.map(( key ) => [key, order[key] ?? ""])) as Record<(typeof keys)[number], string>;

}
export function useOrderContact ( order: Order, onChanged: () => void ) {

    const t = useTranslations("orderContact");
    const contact = useTranslations("contact");
    const toast = useToast();
    const update = useAction("orders", "update");
    const [open, setOpen] = useState(false);
    const form = useFormFields({
        initial: valuesOf(order), failure: update.error, clear: update.clear,
        validate: ( values ) => ({
            ...(values.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email) ? { email: contact("errors.email") } : {}),
            ...(values.notes.length > 255 ? { notes: contact("errors.length") } : {}),
        }),
    });

    function edit () {

        form.reset(valuesOf(order));
        setOpen(true);

    }
    function close () {

        if ( !update.pending ) setOpen(false);

    }
    async function save () {

        if ( update.pending || !form.check() ) return;

        const fields = Object.fromEntries(keys.map(( key ) => [key, form.values[key].trim()]));
        const answer = await update.run({ orderId: order.id, ...fields });

        if ( !answer ) return;

        setOpen(false);
        toast({ title: t("saved"), tone: "success" });
        onChanged();

    }

    return {
        t, form, save, open,
        editable: !order.parent_id && !closed.has(order.status ?? ""),
        pending: update.pending,
        failed: update.error ? t("failed") : null,
        edit, close,
        facts: [
            { key: "email", term: t("email"), detail: order.email || undefined, icon: "mail" },
            { key: "phone", term: t("phone"), detail: order.phone || undefined, icon: "phone" },
            { key: "place", term: t("place"), detail: [order.city, order.country].filter(Boolean).join(", ") || undefined, icon: "pin" },
            { key: "address", term: t("address"), detail: order.address || undefined, icon: "house" },
            { key: "notes", term: t("notes"), detail: order.notes || undefined, icon: "note-pencil" },
        ].filter(( fact ) => fact.detail),
    };

}
