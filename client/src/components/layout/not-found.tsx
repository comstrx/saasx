import { FileQuestion } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/elements/button";
import { Link } from "@/lib/utils/i18n";

export async function NotFound () {

    const t = await getTranslations("errors");

    return (

        <main className="flex min-h-dvh flex-col items-center justify-center gap-6 p-6 text-center">

            <div className="flex size-14 items-center justify-center rounded-full bg-muted">
                <FileQuestion className="size-7 text-muted-foreground" />
            </div>

            <div className="flex flex-col gap-2">

                <h1 className="text-xl font-semibold tracking-tight">{t("notFound")}</h1>

                <p className="max-w-sm text-sm text-muted-foreground">{t("notFoundHint")}</p>

            </div>

            <Button render={<Link href="/" />}>{t("backHome")}</Button>

        </main>

    );

}
