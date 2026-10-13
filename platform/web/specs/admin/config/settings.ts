import { type SiteConfig, t } from "../../../src/lib/spec/surface.ts";

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
        default: "dark",
        enabled: ["light", "dark", "system"],
    },
    fonts: {},
    mediaOrigins: ["http://127.0.0.1:8000"],
    frameOrigins: [],
    screen: {
        render: "client",
        title: true,
        nav: true,
        footer: true,
        sidebar: true,
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
        nav: { feature: "nav", options: { brand: t("admin.brand"), home: t("admin.home"), login: t("shell.login"), account: t("shell.account") } },
        footer: null,
        sidebar: { feature: "sidebar", options: { title: t("admin.menu") } },
        loader: null,
    },
} satisfies SiteConfig["settings"];
