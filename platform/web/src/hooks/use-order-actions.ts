"use client";

import { useEffect, useState } from "react";
import type { Data } from "@/api/features";
import { useFormFields } from "@/hooks/use-form-fields";
import { useOrderMutation } from "@/hooks/use-order-mutation";
import { useLocale, useTranslations } from "@/lib/providers/intl";
import { money } from "@/lib/std/format";
import { actionErrors, actionInput, allowedAction, type OrderAction, orderActions, refundLimit } from "@/lib/std/order-actions";
import { useUi } from "@/stores/provider";

type Order = Data<"orders", "view">;

export function useOrderActions ( order: Order, reload: () => void ) {

    const t = useTranslations("orderActions");
    const locale = useLocale();
    const user = useUi(( state ) => state.user);
    const permissions = user?.permissions ?? [];
    const [selected, setSelected] = useState<OrderAction | null>(null);
    const [done, setDone] = useState<OrderAction | null>(null);
    const mutation = useOrderMutation(order.id, selected);
    const active = orderActions.find(( action ) => action === mutation.attempt?.operation) ?? selected;
    const quantity = Math.max(1, order.quantity ?? 1);
    const limit = refundLimit(order.refundable_amount, order.currency ?? "USD");
    const form = useFormFields({
        initial: { notes: "", quantity: String(quantity), refund: "full", amount: "" },
        validate: ( values ) => Object.fromEntries(Object.entries(actionErrors(active ?? "cancel", values, quantity, limit))
            .map(( [key, value] ) => [key, t(value as "notesLong" | "quantityError" | "amountError", { quantity })])),
        failure: mutation.error, clear: mutation.clear,
    });
    const choices = orderActions.filter(( action ) => allowedAction(order, action, permissions));
    const available = !!active && choices.includes(active);
    const failure = mutation.error;
    const denied = failure?.status === 403;
    const amount = money(order.refundable_amount, locale, order.currency ?? "USD", true);
    const base = limit ? money(limit, locale, "USD", true) : undefined;
    const frozen = mutation.attempt?.input;
    const values = frozen ? {
        notes: frozen.notes ?? frozen.reason ?? "", quantity: String(frozen.quantity ?? quantity),
        refund: frozen.amount ? "partial" : "full", amount: frozen.amount ?? "",
    } : form.values;

    const resultId = form.id("result");

    useEffect(() => {

        if ( done ) document.getElementById(resultId)?.focus();

    }, [done, resultId]);

    function choose ( action: OrderAction ) {

        if ( mutation.locked || !choices.includes(action) ) return;

        mutation.clear();
        setDone(null);
        form.change({ notes: "", quantity: String(quantity), refund: "full", amount: "" });
        setSelected(action);

    }
    function close () {

        if ( mutation.locked ) return;

        mutation.clear();
        setSelected(null);

    }
    async function submit () {

        if ( !active || mutation.pending || mutation.blocked ) return;
        if ( !mutation.attempt && (!available || !form.check()) ) return;

        const result = await mutation.run(actionInput(active, order.id, form.values));

        if ( result ) {

            setDone(active);
            setSelected(null);
            reload();

        }

    }

    return {
        t, form, values, choices, active, choose, close, submit, mutation, available, quantity, limit, amount, base, done,
        message: mutation.blocked ? t(mutation.storageIssue ? "storage" : "blocked")
            : mutation.recovery ? t("uncertain") : denied ? t("denied")
                : failure ? Object.values(failure.errors).flat()[0] || t("failed") : !available ? t("unavailable") : null,
    };

}
