"use client";

import { useAppearance } from "@/hooks/use-preferences";
import { useTranslations } from "@/lib/providers/intl";

export function useThemeToggle () {

    const t = useTranslations("preferences");
    const appearance = useAppearance();
    const dark = appearance.resolved === "dark";

    return {
        label: t("dark"),
        available: appearance.options.includes("light") && appearance.options.includes("dark"),
        dark,
        toggle: () => appearance.change(dark ? "light" : "dark"),
    };

}
