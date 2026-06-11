import createMiddleware from "next-intl/middleware";
import { defaultLocale, locales } from "@/lib/i18n";
import type { Guard } from "./chain";

const intl = createMiddleware({
    locales,
    defaultLocale,
    localePrefix: "always",
});

export const locale: Guard = ( request ) => intl(request);
