import type { SiteConfig } from "../../../src/lib/spec/surface.ts";

export default {
    app: {
        slug: "admin",
        identifier: "app.desk.admin",
    },
    window: {
        width: 1366,
        height: 820,
        minWidth: 720,
        minHeight: 480,
        resizable: true,
        decorations: true,
    },
    permissions: [],
    motion: "system",
    maintenance: false,
    maintenanceMessage: "",
    locale: {
        default: "ar",
        enabled: ["en", "ar"],
        timeZone: "UTC",
    },
    currency: {
        default: "USD",
        enabled: ["USD"],
    },
    theme: {
        default: "dark",
        enabled: ["light", "dark", "system"],
    },
    fonts: {},
    mediaOrigins: ["http://127.0.0.1:8000"],
    screen: {
        title: true,
        nav: true,
        sidebar: false,
        footer: false,
        loader: true,
        scroll: true,
    },
    block: {
        width: "full",
        height: "auto",
        grid: 1,
        sizes: [],
        gap: 6,
        padding: 0,
        align: "stretch",
        tone: "default",
        radius: "none",
        shadow: "none",
    },
    shell: {
        nav: null,
        sidebar: null,
        footer: null,
        loader: null,
    },
} satisfies SiteConfig["settings"];
