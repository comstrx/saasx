import type { SiteConfig } from "../../../src/lib/spec/contract.ts";

export default {
    motion: "system",
    density: "comfortable",
    maintenance: false,
    maintenanceMessage: "",
    locale: {
        default: "en",
        enabled: ["en", "ar"],
        timeZone: "Africa/Cairo",
    },
    currency: {
        default: "USD",
        enabled: ["USD", "SAR", "EGP"],
    },
    theme: {
        default: "light",
        enabled: ["light", "dark", "system"],
    },
    fonts: {
        en: [{ file: "latin.ttf", weight: "200 800" }],
        ar: [{ file: "arabic-regular.ttf", weight: "400" }, { file: "arabic-semibold.ttf", weight: "600" }],
    },
    mediaOrigins: ["https://tile.openstreetmap.org"],
    frameOrigins: [],
    screen: {
        render: "server",
        title: true,
        seo: true,
        index: true,
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
        nav: "nav",
        footer: "footer",
        sidebar: "menu",
        loader: "loader",
    },
} satisfies SiteConfig["settings"];
