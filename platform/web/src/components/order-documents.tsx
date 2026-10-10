"use client";

import type { Data } from "@/api/features";
import Link from "@/elements/link";
import { useOrderDocuments } from "@/hooks/use-order-documents";
import { useTranslations } from "@/lib/providers/intl";
import AccessCode from "./access-code";
import FileList from "./file-list";
import FormRetry from "./form-retry";
import FormSection from "./form-section";

type Props = { order: Data<"orders", "view"> };

export default function OrderDocuments ({ order }: Props) {

    const t = useTranslations("orderFiles");
    const common = useTranslations("common");
    const { catalog, attachments, digital, code, qr } = useOrderDocuments(order);

    return (

        <>

            {attachments.length ? <FormSection title={t("title")} description={t("description")}>

                <FileList items={attachments} label={t("title")} />

            </FormSection> : null}
            {digital.length ? <FormSection title={t("digitalTitle")} description={t("digitalDescription")}>

                <FileList items={digital} label={t("digitalTitle")} pending={catalog.loading} />
                {catalog.error ? <FormRetry
                    id={`files-${order.id}`} message={t("loadFailed")} label={common("retry")} onRetry={catalog.reload}
                /> : null}

            </FormSection> : null}
            {code || qr ? <FormSection title={t("entryTitle")}>

                {code ? <AccessCode
                    key={code} value={code} label={t("code")} hint={t("codeHint")} reveal={t("reveal")}
                    copy={t("copy")} copied={t("copied")} failed={t("copyFailed")}
                /> : null}
                {qr ? <Link href={qr} variant="outlined" target="_blank" rel="noopener noreferrer">{t("qr")}</Link> : null}

            </FormSection> : null}

        </>

    );

}
