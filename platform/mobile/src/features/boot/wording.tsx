import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Labels } from "@/elements/labels";

export function Wording ({ children }: { children: ReactNode }) {

    const { t } = useTranslation();

    return (
        <Labels value={{ back: t("common.back"), close: t("common.close"), clear: t("common.clear"), increase: t("common.increase"), decrease: t("common.decrease") }}>
            {children}
        </Labels>
    );

}
