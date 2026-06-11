import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHeader } from "@/components/shared/page-header";
import { HealthBadge } from "@/features/system-health/health-badge";

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {

    const { locale } = await params;

    setRequestLocale(locale);

    const t = await getTranslations("home");

    return (

        <>

            <PageHeader title={t("title")} />
            <HealthBadge />

        </>

    );

}
