import { type SiteConfig, t } from "../../../src/lib/spec/surface.ts";

export default {
    app: {
        slug: "admin",
        scheme: "admin",
    },
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
        presentation: "stack",
        title: true,
        header: true,
        tabs: false,
        loader: true,
        order: 50,
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
        header: { feature: "nav", options: { brand: t("admin.brand"), login: t("shell.login"), account: t("shell.account") } },
        tabs: { feature: "tabs", options: { label: t("nav.menu") } },
        loader: null,
    },
} satisfies SiteConfig["settings"];
