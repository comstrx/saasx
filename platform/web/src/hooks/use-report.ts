"use client";

import { useState } from "react";
import { useAuthError } from "@/hooks/use-auth-error";
import { useAction } from "@/hooks/use-operation";
import { useToast } from "@/hooks/use-toast";
import { useTranslations } from "@/lib/providers/intl";

export type Reportable = "articles" | "coupons" | "levels" | "orders" | "referrals" | "tickets" | "transactions";
const reasons = ["inaccurate", "inappropriate", "spam", "other"] as const;

export function useReport ( feature: Reportable, id: number ) {

    const t = useTranslations("engage");
    const toast = useToast();
    const report = useAction(feature, "report");
    const [open, setOpen] = useState(false);
    const [reason, setReason] = useState<(typeof reasons)[number]>("inaccurate");
    const [content, setContent] = useState("");
    const error = useAuthError(report.error);
    const input = {
        articles: { articleId: id }, coupons: { couponId: id }, levels: { levelId: id }, orders: { orderId: id },
        referrals: { referralId: id }, tickets: { ticketId: id }, transactions: { transactionId: id },
    }[feature];

    async function send () {

        if ( report.pending || !content.trim() ) return;

        const answer = await report.run({ ...input, reason: t(`reasons.${reason}`), content: content.trim() });

        if ( !answer ) return;

        setOpen(false);
        toast({ title: t("sent"), tone: "success" });

    }

    return {
        t, open, reason, content, setContent, send, error,
        id: `report-${feature}-${id}`,
        reporting: report.pending,
        ask: () => { report.clear(); setContent(""); setOpen(true); },
        close: () => { if ( !report.pending ) setOpen(false); },
        pick: ( value: string ) => setReason(reasons.find(( entry ) => entry === value) ?? "other"),
        reasons: reasons.map(( value ) => ({ value, label: t(`reasons.${value}`) })),
    };

}
