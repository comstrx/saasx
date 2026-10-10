"use client";

import { useState } from "react";
import { useFormFields } from "@/hooks/use-form-fields";
import { useAction, useRead } from "@/hooks/use-operation";
import { useTranslations } from "@/lib/providers/intl";

const decimalAmount = /^\d+(?:\.\d{1,2})?$/;

export function useWalletDeposit ( currency: string, open: boolean ) {

    const t = useTranslations("wallet");
    const gateways = useRead("gateways", "list", {}, { enabled: open });
    const deposit = useAction("gateways", "deposit");
    const [manual, setManual] = useState(false);
    const options = (gateways.data ?? []).filter(( gateway ) => !gateway.capabilities || Array.isArray(gateway.capabilities)
        || gateway.capabilities.deposit !== false).map(( gateway ) => ({
        value: String(gateway.id), label: gateway.label || gateway.name || t("gateway"),
        detail: gateway.description ?? undefined, image: gateway.image ?? null,
    }));
    const form = useFormFields({
        initial: { amount: "", gateway: "" }, failure: deposit.error, clear: deposit.clear,
        validate: ( values ): Record<string, string> => ({
            ...(!decimalAmount.test(values.amount.trim()) || Number(values.amount) <= 0 ? { amount: t("invalidAmount") } : {}),
            ...(!values.gateway ? { gateway: t("gateway") } : {}),
        }),
    });

    async function submit () {

        if ( !form.check() ) return;

        const answer = await deposit.run({
            gatewayId: Number(form.values.gateway), amount: form.values.amount.trim(), currency, redirect_url: window.location.href,
        });
        const target = answer?.resource.pay_url ?? answer?.resource.pay_data?.pay_url;

        if ( target && /^https?:\/\//.test(target) ) window.location.assign(target);
        else if ( answer ) setManual(true);

    }

    return {
        t, form, options, submit, manual, pending: deposit.pending,
        loading: gateways.loading && !gateways.data,
        error: deposit.error ? Object.values(deposit.error.errors).flat()[0] || t("failed") : null,
        reset: () => { setManual(false); form.reset({ amount: "", gateway: "" }); },
    };

}
