"use client";

import type { ApiClient } from "@engine/api";
import { useMemo } from "react";
import type { Endpoints } from "@/api/features";
import { browserApi } from "@/api/workflow/browser";
import { useLocale } from "@/hooks/use-locale";
import { useSession } from "@/hooks/use-session";

export function useApi (): ApiClient<Endpoints> {
    const locale = useLocale();
    const { token, end } = useSession();

    return useMemo(() => browserApi(locale, () => token, end), [locale, token, end]);
}
