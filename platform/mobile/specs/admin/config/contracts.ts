import { env, type SiteConfig } from "../../../src/lib/spec/surface.ts";

export default {
    urls: { production: "http://127.0.0.1:8000", local: "http://127.0.0.1:8000" },
    options: { prefix: "v1", tenant: "admin.zainlak.com", insecure: true },
    realtime: { url: "ws://127.0.0.1:8080", key: env("REALTIME_KEY", "local") },
} satisfies SiteConfig["contracts"];
