export const themeDefaults = {
    colors: {
        light: {
            body: "#f5f5f5", panel: "#ffffff", ink: "#1c1c1c", muted: "#6b6b6b", line: "#e8e8e8", focus: "#1c1c1c",
            primary: "#087f6c", accent: "#e86a2c", success: "#0b7a49", warning: "#8a5300", danger: "#b0292f", info: "#1f5fb3",
        },
        dark: {
            body: "#0a0a0a", panel: "#141414", ink: "#ededed", muted: "#a3a3a3", line: "#1f1f1f", focus: "#ededed",
            primary: "#1fbb9c", accent: "#f08a4c", success: "#4cc38a", warning: "#f0b44c", danger: "#ff8a8f", info: "#7fb0ff",
        },
    },
};
export const space = { 0: 0, 1: 4, 2: 8, 3: 12, 4: 16, 6: 24, 8: 32, 12: 48 } as const;
export const radius = { none: 0, sm: 6, md: 12, lg: 20, full: 9999 } as const;
export const type = {
    xs: { size: 12, line: 16, weight: 400 },
    sm: { size: 14, line: 20, weight: 400 },
    md: { size: 16, line: 24, weight: 400 },
    lg: { size: 20, line: 28, weight: 600 },
    xl: { size: 28, line: 36, weight: 700 },
} as const;
export const motion = {
    durations: { instant: 0, fast: 120, base: 200, slow: 320, expressive: 600 },
    easings: {
        standard: "cubic-bezier(0.2, 0, 0, 1)",
        enter: "cubic-bezier(0, 0, 0, 1)",
        exit: "cubic-bezier(0.3, 0, 1, 1)",
        spring: "cubic-bezier(0.34, 1.56, 0.64, 1)",
    },
};
export const currency = { default: "USD", enabled: ["USD"] };
export const countries = ["EG", "SA", "AE"];
