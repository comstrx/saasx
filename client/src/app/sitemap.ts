import type { MetadataRoute } from "next";
import { env } from "@/lib/env/client";
import { locales } from "@/lib/utils/i18n";

const routes = [""] as const;

export default function sitemap (): MetadataRoute.Sitemap {

    const now = new Date();

    return locales.flatMap((locale) =>
        routes.map((route) => ({
            url: `${env.NEXT_PUBLIC_SITE_URL}/${locale}${route}`,
            lastModified: now,
            changeFrequency: "weekly" as const,
            priority: route === "" ? 1 : 0.8,
        })),
    );

}
