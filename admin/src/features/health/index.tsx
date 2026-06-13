"use client";

import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/elements/badge";
import { Skeleton } from "@/components/ui/elements/skeleton";
import { useHealth } from "@/features/health/use-health";
import { useNow } from "@/hooks/use-now";
import { formatRelative } from "@/lib/std/date";

export function Health ({ locale }: { locale: string }) {

    const t = useTranslations("systemHealth");
    const { isPending, isUp, checkedAt } = useHealth();

    useNow(30_000);

    if ( isPending ) return <Skeleton className="h-6 w-40" />;

    return (

        <div className="flex items-center gap-2">

            <Badge variant={isUp ? "default" : "destructive"}>
                {isUp ? t("ok") : t("unreachable")}
            </Badge>

            {
                checkedAt &&
                <span className="text-sm text-muted-foreground">
                    {t("checkedAgo", { ago: formatRelative(checkedAt.toISOString(), locale) })}
                </span>
            }

        </div>

    );

}
