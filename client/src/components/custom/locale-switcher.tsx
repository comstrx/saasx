"use client";

import { motion, useReducedMotion } from "motion/react";
import { useLocale, useTranslations } from "next-intl";
import { lift, press, transition } from "@/lib/motion";
import { Link, locales, usePathname } from "@/lib/utils/i18n";
import { cn } from "@/lib/utils/shadcn";

export function LocaleSwitcher () {

    const t = useTranslations("home");
    const active = useLocale();
    const pathname = usePathname();
    const reduce = useReducedMotion();

    return (

        <nav
            aria-label={t("switchLanguage")}
            className="inline-flex items-center gap-1 rounded-full border bg-muted/50 p-1 shadow-sm"
        >

            {
                locales.map((locale) => {

                    const isActive = locale === active;

                    return (

                        <Link
                            key={locale}
                            href={pathname}
                            locale={locale}
                            hrefLang={locale}
                            aria-current={isActive ? "true" : undefined}
                            className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
                        >

                            <motion.span
                                whileHover={reduce ? undefined : lift}
                                whileTap={reduce ? undefined : press}
                                transition={transition.fast}
                                className={cn(
                                    "block rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
                                    isActive
                                        ? "bg-primary text-primary-foreground shadow-sm"
                                        : "text-muted-foreground hover:bg-accent hover:text-foreground",
                                )}
                            >
                                {t(`locales.${locale}`)}
                            </motion.span>

                        </Link>

                    );

                })
            }

        </nav>

    );

}
