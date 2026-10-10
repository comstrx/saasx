"use client";

import type { Data } from "@/api/features";
import { useTranslations } from "@/lib/providers/intl";

type Gateway = Data<"gateways", "list">;

export function usePaymentChoices ( gateways: readonly Gateway[], method: string, later = false ) {

    const t = useTranslations("checkout");
    const permitted = gateways.filter(( gateway ) => !gateway.capabilities || Array.isArray(gateway.capabilities)
        || gateway.capabilities.pay !== false);
    const options = [
        { value: "wallet", label: t("wallet"), detail: t("walletHint"), icon: "wallet", image: null as string | null },
        ...(later ? [{ value: "later", label: t("later"), detail: t("laterHint"), icon: "clock", image: null as string | null }] : []),
        ...permitted.map(( gateway ) => ({
            value: `gateway:${gateway.id}`, label: gateway.label || gateway.name || t("onlinePayment"), icon: "card",
            image: gateway.image || null, ...(gateway.description ? { detail: gateway.description } : {}),
        })),
    ];
    const gateway = permitted.find(( item ) => `gateway:${item.id}` === method);
    const currencies = [...new Set((gateway?.currencies ?? [])
        .filter(( row ) => row.active !== false && (!row.purpose || row.purpose === "pay"))
        .flatMap(( row ) => row.currency ? [row.currency] : []))];

    return { options, currencies };

}
