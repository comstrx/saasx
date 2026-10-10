import PageLoader from "@/components/page-loader";
import { getTranslations } from "@/lib/providers/intl-server";

export default async function SiteLoader () {

    const t = await getTranslations("common");

    return <PageLoader label={t("loading")} />;

}
