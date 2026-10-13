import type { SiteConfig } from "../../../src/lib/spec/surface.ts";

export default {
    urls: { production: "http://127.0.0.1:8000", local: "http://127.0.0.1:8000" },
    options: { prefix: "v1", tenant: "admin.zainlak.com" },
    realtime: { url: "ws://127.0.0.1:8080", key: "6rpjrzvvcxnufcmuuohi" },
} satisfies SiteConfig["contracts"];
