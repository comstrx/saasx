"use client";

import { RotateCcw, TriangleAlert } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/elements/button";

export function ErrorState ({ digest, reset }: { digest?: string; reset: () => void }) {

    const t = useTranslations("errors");

    return (

        <main className="flex min-h-dvh flex-col items-center justify-center gap-6 p-6 text-center">

            <div className="flex size-14 items-center justify-center rounded-full bg-destructive/10">
                <TriangleAlert className="size-7 text-destructive" />
            </div>

            <div className="flex flex-col gap-2">

                <h1 className="text-xl font-semibold tracking-tight">{t("crashed")}</h1>
                <p className="max-w-sm text-sm text-muted-foreground">{t("crashedHint")}</p>

            </div>

            <Button onClick={reset}>

                <RotateCcw data-dir-flip className="size-4" />
                {t("retry")}

            </Button>

            {digest ? <code className="text-xs text-muted-foreground/60">{digest}</code> : null}

        </main>

    );

}
