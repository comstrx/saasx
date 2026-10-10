"use client";

import { useState } from "react";
import { useConfirmation } from "@/hooks/use-confirmation";
import { useFormFields } from "@/hooks/use-form-fields";
import { useAction, useRead } from "@/hooks/use-operation";
import { useTranslations } from "@/lib/providers/intl";

const decimalAmount = /^\d+(?:\.\d{1,2})?$/;

type Slot = { name: string; label?: string | null; placeholder?: string | null; type?: string | null; required?: boolean | null };

export function useWalletWithdraw ( currency: string, open: boolean, onDone: () => void ) {

    const t = useTranslations("wallet");
    const gateways = useRead("gateways", "list", {}, { enabled: open });
    const withdraw = useAction("gateways", "withdraw");
    const [done, setDone] = useState(false);
    const [details, setDetails] = useState<Record<string, string>>({});
    const usable = (gateways.data ?? []).filter(( gateway ) => !gateway.capabilities || Array.isArray(gateway.capabilities)
        || gateway.capabilities.withdraw !== false);
    const form = useFormFields({
        initial: { amount: "", gateway: "" }, failure: withdraw.error, clear: withdraw.clear,
        validate: ( values ): Record<string, string> => ({
            ...(!decimalAmount.test(values.amount.trim()) || Number(values.amount) <= 0 ? { amount: t("invalidAmount") } : {}),
            ...(!values.gateway ? { gateway: t("gateway") } : {}),
        }),
    });
    const chosen = usable.find(( gateway ) => String(gateway.id) === form.values.gateway);
    const fields: Slot[] = chosen?.fields && !Array.isArray(chosen.fields) ? chosen.fields.withdraw ?? [] : [];
    const missing = fields.filter(( slot ) => slot.required && !details[slot.name]?.trim()).map(( slot ) => slot.name);
    const confirmation = useConfirmation(withdraw.error, `${form.values.gateway}:${form.values.amount}`, withdraw.pending, withdraw.clear);

    async function submit ( resend = false ) {

        if ( !form.check(Object.fromEntries(missing.map(( name ) => [`detail-${name}`, t("required")]))) ) return;

        const answer = await withdraw.run({
            gatewayId: Number(form.values.gateway), amount: form.values.amount.trim(), currency,
            ...(fields.length ? {
                recipient: Object.fromEntries(fields.map(( slot ) => [slot.name, (details[slot.name] ?? "").trim()])),
            } : {}),
            ...(confirmation.challenge && confirmation.code && !resend ? { confirm_code: confirmation.code } : {}),
        });

        if ( answer ) {

            setDone(true);
            onDone();

        }

    }

    return {
        t, form, fields, details, done, confirmation, submit, pending: withdraw.pending,
        setDetail: ( name: string, value: string ) => setDetails(( current ) => ({ ...current, [name]: value })),
        options: usable.map(( gateway ) => ({
            value: String(gateway.id), label: gateway.label || gateway.name || t("gateway"), detail: gateway.description ?? undefined,
        })),
        loading: gateways.loading && !gateways.data,
        error: withdraw.error && !withdraw.error.confirmation ? Object.values(withdraw.error.errors).flat()[0] || t("failed") : null,
        reset: () => { setDone(false); setDetails({}); form.reset({ amount: "", gateway: "" }); },
    };

}
