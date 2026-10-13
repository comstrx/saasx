export type ThemeName = "light" | "dark" | "system";
export type Motion = "system" | "full" | "reduced";

/**
 * The defaults every surface starts from; a surface adds its locale table and its own options, a
 * spec overrides any of them.
 */
export const sharedSettingsDefaults: {
    motion: Motion;
    maintenance: boolean;
    maintenanceMessage: string;
    fonts: Record<string, never>;
    mediaOrigins: string[];
    currency: { default: string; enabled: string[] };
    theme: { default: ThemeName; enabled: ThemeName[] };
} = {
    motion: "system",
    maintenance: false,
    maintenanceMessage: "",
    fonts: {},
    mediaOrigins: [],
    currency: { default: "USD", enabled: ["USD"] },
    theme: { default: "system", enabled: ["light", "dark", "system"] },
};
export const themeDefaults = {
    colors: {
        light: {
            body: "#f5f5f5",
            panel: "#ffffff",
            ink: "#1c1c1c",
            muted: "#6b6b6b",
            line: "#e8e8e8",
            focus: "#1c1c1c",
            primary: "#087f6c",
            accent: "#e86a2c",
            success: "#0b7a49",
            warning: "#8a5300",
            danger: "#b0292f",
            info: "#1f5fb3",
        },
        dark: {
            body: "#0a0a0a",
            panel: "#141414",
            ink: "#ededed",
            muted: "#a3a3a3",
            line: "#1f1f1f",
            focus: "#ededed",
            primary: "#1fbb9c",
            accent: "#f08a4c",
            success: "#4cc38a",
            warning: "#f0b44c",
            danger: "#ff8a8f",
            info: "#7fb0ff",
        },
    },
};
