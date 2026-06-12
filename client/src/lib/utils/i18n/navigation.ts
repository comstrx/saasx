
import { createNavigation } from "next-intl/navigation";
import { defineRouting } from "next-intl/routing";
import { env } from "@/lib/env/client";
import { locales } from "./direction";

export const routing = defineRouting({
    locales,
    defaultLocale: env.NEXT_PUBLIC_APP_LOCALE,
    localePrefix: "always",
});

export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing);
