import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {

    return {
        name: "SaaSX Admin",
        short_name: "SaaSX Admin",
        display: "standalone",
        start_url: "/",
        background_color: "#ffffff",
        theme_color: "#171717",
    };

}
