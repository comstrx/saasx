import { setRequestLocale } from "next-intl/server";
import { Hello } from "@/components/custom/hello";

export default async function HomePage ({ params }: { params: Promise<{ locale: string }> }) {

    const { locale } = await params;

    setRequestLocale(locale);

    return <Hello />;

}
