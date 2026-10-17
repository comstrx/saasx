import type { SiteConfig } from "../../../src/lib/spec/surface.ts";

export default {
    delivery: "server",
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
        default: "light",
        enabled: ["light", "dark", "system"],
    },
    fonts: {},
    mediaOrigins: ["http://127.0.0.1:8000"],
    frameOrigins: [],
    screen: {
        render: "server",
        title: true,
        nav: true,
        footer: true,
        sidebar: false,
        loader: true,
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
        footer: null,
        sidebar: null,
        loader: null,
    },
} satisfies SiteConfig["settings"];
