import type { MetadataRoute } from "next";
import { env } from "@/lib/env/client";

export default function robots (): MetadataRoute.Robots {

    return {
        // rules: { userAgent: "*", disallow: "/" },
        rules: { userAgent: "*", allow: "/" },
        sitemap: `${env.NEXT_PUBLIC_SITE_URL}/sitemap.xml`,
    };

}
