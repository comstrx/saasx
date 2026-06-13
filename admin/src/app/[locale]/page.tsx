import { getTranslations, setRequestLocale } from "next-intl/server";
import { Header } from "@/components/layout/header";
import { Health } from "@/features/health";

export default async function Page ({ params }: { params: Promise<{ locale: string }> }) {

    const { locale } = await params;

    setRequestLocale(locale);

    const t = await getTranslations("home");

    return (

        <>

            <Header title={t("title")} />
            <Health locale={locale} />

        </>

    );

}
