import type { SiteConfig } from "../../../src/lib/spec/surface.ts";

export default {
    urls: {
        production: "http://127.0.0.1:8000",
        local: "http://127.0.0.1:8000",
    },
    assets: "http://127.0.0.1:3000",
    options: {
        prefix: "v1",
        tenant: null,
        insecure: true,
    },
} satisfies SiteConfig["contracts"];
