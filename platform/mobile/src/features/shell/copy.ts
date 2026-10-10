import { useTranslation } from "react-i18next";
import type { ConfirmCopy } from "@/components/confirm-sheet";
import type { ReportReason } from "@/components/report-sheet";

const reportReasons = [ "inaccurate", "notSuitable", "scam", "offensive", "other" ] as const;

type ReportCopy = {
    reasons: readonly ReportReason[];
    action: string;
    noteHint: string;
};

export function useConfirmCopy (): ConfirmCopy {

    const { t } = useTranslation();

    return {
        title: t("confirm.title"),
        action: t("confirm.action"),
        body: t("confirm.body"),
        resend: t("auth.resend"),
        code: t("auth.codeLabel"),
    };

}

export function usePartyText (): ( adults: number, children: number ) => string {

    const { t } = useTranslation();

    return ( adults, children ) => [
        t("details.guestAdults", { count: adults }),
        children > 0 ? t("details.guestChildren", { count: children }) : null,
    ].filter(Boolean).join(" · ");

}

export function useReportCopy (): ReportCopy {

    const { t } = useTranslation();

    return {
        reasons: reportReasons.map(( key ) => ({ key, label: t(`details.reportReason.${ key }`), open: key === "other" }) ),
        action: t("details.reportSend"),
        noteHint: t("details.reportNoteHint"),
    };

}
