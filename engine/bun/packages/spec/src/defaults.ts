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
    theme: { default: ThemeName; enabled: ThemeName[] };
} = {
    motion: "system",
    maintenance: false,
    maintenanceMessage: "",
    fonts: {},
    mediaOrigins: [],
    theme: { default: "system", enabled: ["light", "dark", "system"] },
};
