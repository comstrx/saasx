export type ThemeName = "light" | "dark" | "system";
export type Motion = "system" | "full" | "reduced";

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
