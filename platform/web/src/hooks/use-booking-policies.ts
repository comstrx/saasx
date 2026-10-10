"use client";

import type { Data } from "@/api/features";
import { useTranslations } from "@/lib/providers/intl";

type Policies = Data<"products", "order">["product"]["policies"];

export function useBookingPolicies ( policies: Policies ) {

    const t = useTranslations("detail");

    return (policies ?? []).flatMap(( policy ) => {

        const lines = [
            policy.description,
            policy.refundable === false ? t("nonRefundable") : null,
            policy.free_before_hours ? t("freeCancel", { hours: policy.free_before_hours }) : null,
            policy.refund_dest === "wallet" ? t("refundWallet") : null,
            policy.refund_dest === "source" ? t("refundSource") : null,
        ].filter(Boolean);

        return lines.length ? [{ key: String(policy.id), title: policy.title || t("policy"), body: lines.join("\n\n") }] : [];

    });

}
