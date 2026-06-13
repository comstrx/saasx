import { getTranslations, setRequestLocale } from "next-intl/server";
import Hello from "@/features/hello";

export default async function HomePage ({ params }: { params: Promise<{ locale: string }> }) {

    const { locale } = await params;

    setRequestLocale(locale);

    const _t = await getTranslations("home");

    return (

        <>

            <Hello />

        </>

    );

}
