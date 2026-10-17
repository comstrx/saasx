import type { SiteConfig } from "../../../src/lib/spec/surface.ts";

export default {
    app: {
        slug: "app",
        scheme: "app",
    },
    motion: "system",
    maintenance: false,
    maintenanceMessage: "",
    locale: {
        default: "en",
        enabled: ["en", "ar"],
        timeZone: "UTC",
    },
    currency: {
        default: "USD",
        enabled: ["USD"],
    },
    theme: {
        default: "system",
        enabled: ["light", "dark", "system"],
    },
    fonts: {},
    mediaOrigins: ["http://127.0.0.1:8000"],
    screen: {
        presentation: "stack",
        title: true,
        header: true,
        tabs: false,
        loader: true,
        order: 50,
        scroll: true,
    },
    block: {
        width: "full",
        height: "auto",
        grid: 1,
        gap: 4,
        padding: 4,
        align: "stretch",
        tone: "default",
        radius: "none",
    },
    shell: {
        header: null,
        tabs: null,
        loader: null,
    },
} satisfies SiteConfig["settings"];
