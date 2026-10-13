"use client";

import { choose } from "@engine/base";
import { useParams } from "next/navigation";
import { routing } from "@/lib/spec/config";

export function useLocale (): string {
    const params = useParams<{ locale?: string }>();

    return choose(routing.locales, params.locale, routing.defaultLocale);
}
