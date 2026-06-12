import type { MetadataRoute } from "next";
import { env } from "@/lib/env/client";

export default function manifest (): MetadataRoute.Manifest {

    return {
        name: env.NEXT_PUBLIC_APP_NAME,
        short_name: env.NEXT_PUBLIC_APP_NAME,
        description: env.NEXT_PUBLIC_APP_DESCRIPTION,
        display: "standalone",
        start_url: "/",
        background_color: "#0a0a0a",
        theme_color: "#171717",
    };

}
