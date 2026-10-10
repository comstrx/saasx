import type { z } from "../providers/schema.ts";
import type { fontsShape, settingsShape, themeShape } from "./contract.ts";

export const fontDefaults = {
    en: [
        { file: "latin.ttf", weight: "200 800" }
    ],
    ar: [
        { file: "arabic-regular.ttf", weight: "400" },
        { file: "arabic-semibold.ttf", weight: "600" }
    ],
} satisfies z.input<typeof fontsShape>;

export const settingsDefaults = {
    motion: "system",
    density: "comfortable",
    maintenance: false,
    maintenanceMessage: "",
    fonts: fontDefaults,
    mediaOrigins: [],
    frameOrigins: [],
    locale: {
        default: "en",
        enabled: ["en", "ar"],
        timeZone: "Africa/Cairo"
    },
    currency: {
        default: "USD",
        enabled: ["USD", "SAR", "EGP"]
    },
    theme: {
        default: "light",
        enabled: ["light", "dark", "system"]
    },
    screen: {
        render: "server",
        title: true,
        seo: true,
        index: true,
        nav: true,
        footer: true,
        sidebar: false,
        loader: true
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
        shadow: "none"
    },
    shell: {
        nav: null,
        footer: null,
        sidebar: null,
        loader: null
    },
} satisfies z.input<typeof settingsShape>;

export const themeDefaults = {
    colors: {
        light: {
            body: "var(--palette-light-body)",
            panel: "var(--palette-light-panel)",
            popup: "var(--palette-light-popup)",
            control: "var(--palette-light-control)",
            menu: "var(--palette-light-menu)",
            track: "var(--palette-light-track)",
            ink: "var(--palette-light-ink)",
            muted: "var(--palette-light-muted)",
            placeholder: "var(--palette-light-placeholder)",
            disabled: "var(--palette-light-disabled)",
            edge: "var(--palette-light-edge)",
            float: "var(--palette-light-float)",
            line: "var(--palette-light-line)",
            strong: "var(--palette-light-strong)",
            field: "var(--palette-light-field)",
            focus: "var(--palette-light-focus)",
            primary: "var(--palette-light-primary)",
            accent: "var(--palette-light-accent)",
            action: "var(--palette-light-action)",
            ember: "var(--palette-light-ember)",
            offer: "var(--palette-light-offer)",
            success: "var(--palette-light-success)",
            warning: "var(--palette-light-warning)",
            danger: "var(--palette-light-danger)",
            info: "var(--palette-light-info)",
        },
        dark: {
            body: "var(--palette-dark-body)",
            panel: "var(--palette-dark-panel)",
            popup: "var(--palette-dark-popup)",
            control: "var(--palette-dark-control)",
            menu: "var(--palette-dark-menu)",
            track: "var(--palette-dark-track)",
            ink: "var(--palette-dark-ink)",
            muted: "var(--palette-dark-muted)",
            placeholder: "var(--palette-dark-placeholder)",
            disabled: "var(--palette-dark-disabled)",
            edge: "var(--palette-dark-edge)",
            float: "var(--palette-dark-float)",
            line: "var(--palette-dark-line)",
            strong: "var(--palette-dark-strong)",
            field: "var(--palette-dark-field)",
            focus: "var(--palette-dark-focus)",
            primary: "var(--palette-dark-primary)",
            accent: "var(--palette-dark-accent)",
            action: "var(--palette-dark-action)",
            ember: "var(--palette-dark-ember)",
            offer: "var(--palette-dark-offer)",
            success: "var(--palette-dark-success)",
            warning: "var(--palette-dark-warning)",
            danger: "var(--palette-dark-danger)",
            info: "var(--palette-dark-info)",
        },
    },
} satisfies z.input<typeof themeShape>;
