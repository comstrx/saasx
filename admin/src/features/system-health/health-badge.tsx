"use client";

import { useLocale, useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { useNow } from "@/hooks/use-now";
import { formatRelative } from "@/lib/date";
import { useHealth } from "./use-health";

const VARIANTS = {
    ok: "default",
    checking: "secondary",
    unreachable: "destructive",
} as const;

export function HealthBadge() {

    const t = useTranslations("systemHealth");
    const locale = useLocale();
    const { data, isPending, isError, dataUpdatedAt, errorUpdatedAt } = useHealth();

    useNow(10_000);

    const resolve = () => {

        if ( isPending ) return "checking" as const;

        if ( isError || data.data.status !== "ok" ) return "unreachable" as const;

        return "ok" as const;

    };

    const status = resolve();
    const lastUpdatedAt = Math.max(dataUpdatedAt, errorUpdatedAt);

    return (

        <div className="flex flex-col items-start gap-1">

            <Badge variant={VARIANTS[status]}>{t(`status.${status}`)}</Badge>

            {lastUpdatedAt > 0 && (
                <span className="text-xs text-muted-foreground">
                    {t("checkedAgo", { ago: formatRelative(new Date(lastUpdatedAt).toISOString(), locale) })}
                </span>
            )}

        </div>

    );

}
