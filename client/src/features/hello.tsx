"use client"

import { useTranslations } from "next-intl";
import { Header } from "@/components/layout/header";

export default function Hello () {

    const t = useTranslations("app");

    return (

        <>

            <Header title={t("title")} />

            <div>{t("description")}</div>

        </>

    );

}
