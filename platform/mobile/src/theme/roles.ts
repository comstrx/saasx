import type { BoxShadowValue } from "react-native";
import surfaces from "@/brand/surfaces.json";

export type Tone = {
    base: string;
    on: string;
    soft: string;
    onSoft: string;
    line: string;
    edge: string;
    deep: string;
    dusk: string;
    bright: string;
    vivid: string;
    glow: string;
};

export type ToneName = "brand" | "accent" | "success" | "danger" | "warning" | "info" | "neutral";

export type InkName = "strong" | "base" | "soft" | "faint" | "glyph" | "disabled" | "inverse";

export type PlaneName = "canvas" | "base" | "raised" | "well" | "groove" | "sunken" | "stage";

export type LineName = "hair" | "soft" | "strong" | "focus";

type States = {
    press: string;
    selected: string;
    numb: number;
    quiet: number;
    veil: string;
};

type Photo = {
    dim: string;
    dusk: string;
    band: string;
    chip: string;
    chipEdge: string;
    dot: string;
};

type Shimmer = {
    glare: string;
    sheen: string;
    clear: string;
};

export type Ceramic = {
    fill: string;
    light: string;
    shade: string;
    glow: string;
    rim: string;
    ink: string;
};

type Ceramics = {
    primary: Ceramic;
    danger: Ceramic;
    featured: Ceramic;
    pebble: Ceramic;
    knob: Ceramic;
};

type Casts = {
    lift: BoxShadowValue[];
    raise: BoxShadowValue[];
    float: BoxShadowValue[];
};

type Chat = {
    wallTop: string;
    wallBottom: string;
    doodle: string;
    mine: string;
    mineMeta: string;
    theirs: string;
    glass: string;
    stamp: string;
};

type Cartography = {
    land: string;
    road: string;
    curb: string;
    highway: string;
    border: string;
    water: string;
    green: string;
    label: string;
};

export type Roles = {
    ink: Record<InkName, string>;
    plane: Record<PlaneName, string> & { veil: string; scrim: string };
    line: Record<LineName, string>;
    tone: Record<ToneName, Tone>;
    state: States;
    photo: Photo;
    shimmer: Shimmer;
    terrain: Cartography;
    chat: Chat;
    cast: Casts;
    contact: string;
    ceramic: Ceramics;
    star: string;
};

const cast = ( offsetY: number, blurRadius: number, color: string ): BoxShadowValue => ({ offsetX: 0, offsetY, blurRadius, color });

const lighter: Record<PlaneName, PlaneName> = { canvas: "base", base: "well", raised: "well", well: "raised", groove: "well", sunken: "base", stage: "sunken" };

const whiter: Record<PlaneName, PlaneName> = { canvas: "base", base: "well", raised: "well", well: "base", groove: "well", sunken: "base", stage: "sunken" };

export const above = ( plane: PlaneName, night: boolean ): PlaneName => night ? lighter[plane] : whiter[plane];

export const lightRoles: Roles = {
    ink: {
        strong: "#1a1d21",
        base: "#1a1d21",
        soft: "#707579",
        faint: "#6b6f73",
        glyph: "#1a1d21",
        disabled: "#a6adb3",
        inverse: "#ffffff",
    },
    plane: {
        canvas: surfaces.light,
        base: "#ffffff",
        raised: "#ffffff",
        well: "#f4f4f5",
        groove: "#ffffff",
        sunken: "#f1f1f3",
        stage: "#000000",
        veil: "#ffffff",
        scrim: "rgba(26, 29, 33, 0.32)",
    },
    line: {
        hair: "#ececec",
        soft: "#dcdce0",
        strong: "#a6adb3",
        focus: "#087f6c",
    },
    tone: {
        brand: { base: "#087f6c", on: "#ffffff", soft: "#e6f5f1", onSoft: "#087f6c", line: "#c2e7de", edge: "#087f6c", deep: "#066a5a", dusk: "#04463c", bright: "#0aa38a", vivid: "#0aa38a", glow: "rgba(8, 127, 108, 0.28)" },
        accent: { base: "#e86a2c", on: "#ffffff", soft: "#fdf0e8", onSoft: "#c4561c", line: "#f6cdb4", edge: "#e86a2c", deep: "#c4561c", dusk: "#8a3a10", bright: "#f08a4c", vivid: "#ef7d3c", glow: "rgba(232, 106, 44, 0.28)" },
        success: { base: "#0b7a49", on: "#ffffff", soft: "#e7f3ec", onSoft: "#0b7a49", line: "#b9dcc8", edge: "#0b7a49", deep: "#086239", dusk: "#05432a", bright: "#2e9e6b", vivid: "#2fb36b", glow: "rgba(11, 122, 73, 0.26)" },
        danger: { base: "#c0353b", on: "#ffffff", soft: "#fbeced", onSoft: "#b0292f", line: "#f0c3c5", edge: "#b0292f", deep: "#9c2329", dusk: "#6e1a1e", bright: "#e05a60", vivid: "#e9505a", glow: "rgba(192, 53, 59, 0.26)" },
        warning: { base: "#f0b44c", on: "#1c1c1c", soft: "#fbf2e2", onSoft: "#8a5300", line: "#ecd3a5", edge: "#8a5300", deep: "#c98a1f", dusk: "#6b4100", bright: "#f6c873", vivid: "#f5a623", glow: "rgba(201, 138, 31, 0.28)" },
        info: { base: "#1f5fb3", on: "#ffffff", soft: "#eaf1fb", onSoft: "#1f5fb3", line: "#c0d4f0", edge: "#1f5fb3", deep: "#184c90", dusk: "#10335f", bright: "#4a85d6", vivid: "#2d9ee6", glow: "rgba(31, 95, 179, 0.26)" },
        neutral: { base: "#707579", on: "#ffffff", soft: "#f1f1f3", onSoft: "#1a1d21", line: "#e3e3e6", edge: "#a6adb3", deep: "#3d4246", dusk: "#1a1d21", bright: "#a6adb3", vivid: "#8e9297", glow: "rgba(26, 29, 33, 0.1)" },
    },
    state: {
        press: "rgba(26, 29, 33, 0.06)",
        selected: "#f1f1f3",
        numb: 0.45,
        quiet: 0.78,
        veil: "rgba(255, 255, 255, 0.62)",
    },
    photo: {
        dim: "rgba(0, 0, 0, 0)",
        dusk: "rgba(0, 0, 0, 0)",
        band: "rgba(0, 0, 0, 0.5)",
        chip: "rgba(17, 17, 17, 0.56)",
        chipEdge: "rgba(255, 255, 255, 0.24)",
        dot: "rgba(255, 255, 255, 0.6)",
    },
    shimmer: {
        glare: "rgba(255, 255, 255, 0.85)",
        sheen: "rgba(255, 255, 255, 0.55)",
        clear: "rgba(255, 255, 255, 0)",
    },
    terrain: {
        land: "#f1f1ef",
        road: "#ffffff",
        curb: "#e3e3e3",
        highway: "#ececec",
        border: "#b5b5b5",
        water: "#cfe0ee",
        green: "#dcecd9",
        label: "#6b6b6b",
    },
    chat: {
        wallTop: "#f6f6f7",
        wallBottom: "#f1f1f3",
        doodle: "rgba(26, 29, 33, 0.05)",
        mine: "#e2f6ef",
        mineMeta: "#4f7d72",
        theirs: "#ffffff",
        glass: "rgba(255, 255, 255, 0.94)",
        stamp: "rgba(26, 29, 33, 0.3)",
    },
    cast: {
        lift: [],
        raise: [ cast(2, 8, "rgba(0, 0, 0, 0.06)"), cast(10, 30, "rgba(0, 0, 0, 0.1)") ],
        float: [ cast(2, 10, "rgba(0, 0, 0, 0.06)"), cast(10, 30, "rgba(0, 0, 0, 0.08)") ],
    },
    contact: "rgba(26, 29, 33, 0.16)",
    ceramic: {
        primary: { fill: "#087f6c", light: "#087f6c", shade: "#087f6c", glow: "rgba(8, 127, 108, 0)", rim: "rgba(255, 255, 255, 0)", ink: "#ffffff" },
        danger: { fill: "#c0353b", light: "#c0353b", shade: "#c0353b", glow: "rgba(192, 53, 59, 0)", rim: "rgba(255, 255, 255, 0)", ink: "#ffffff" },
        featured: { fill: "#f1f1f3", light: "#f1f1f3", shade: "#f1f1f3", glow: "rgba(0, 0, 0, 0)", rim: "rgba(255, 255, 255, 0)", ink: "#1a1d21" },
        pebble: { fill: "#ffffff", light: "#ffffff", shade: "#ffffff", glow: "rgba(0, 0, 0, 0)", rim: "rgba(255, 255, 255, 0)", ink: "#1a1d21" },
        knob: { fill: "#ffffff", light: "#ffffff", shade: "#ffffff", glow: "rgba(0, 0, 0, 0.22)", rim: "rgba(255, 255, 255, 0)", ink: "#1a1d21" },
    },
    star: "#f5b301",
};

export const darkRoles: Roles = {
    ink: {
        strong: "#ffffff",
        base: "#ffffff",
        soft: "#8a8b8f",
        faint: "#7a7a7e",
        glyph: "#7d7d7d",
        disabled: "#4d4d50",
        inverse: "#000000",
    },
    plane: {
        canvas: surfaces.dark,
        base: "#181819",
        raised: "#262728",
        well: "#272728",
        groove: "#232324",
        sunken: "#212124",
        stage: "#000000",
        veil: "#ffffff",
        scrim: "rgba(0, 0, 0, 0.24)",
    },
    line: {
        hair: "#0c0c0c",
        soft: "rgba(255, 255, 255, 0.12)",
        strong: "#5c5d61",
        focus: "#5fd8c0",
    },
    tone: {
        brand: { base: "#087f6c", on: "#ffffff", soft: "#1d3330", onSoft: "#5fd8c0", line: "#1f4a42", edge: "#5fd8c0", deep: "#066a5a", dusk: "#04463c", bright: "#3fd0b4", vivid: "#0aa38a", glow: "rgba(63, 208, 180, 0.3)" },
        accent: { base: "#f08a4c", on: "#ffffff", soft: "#2a1a10", onSoft: "#f08a4c", line: "#5a3016", edge: "#f08a4c", deep: "#d0702f", dusk: "#8a3a10", bright: "#f6a873", vivid: "#ef7d3c", glow: "rgba(240, 138, 76, 0.3)" },
        success: { base: "#2e9e6b", on: "#ffffff", soft: "#10231a", onSoft: "#4cc38a", line: "#1d4a33", edge: "#4cc38a", deep: "#23825a", dusk: "#143d2a", bright: "#6fd3a2", vivid: "#2fb36b", glow: "rgba(46, 158, 107, 0.3)" },
        danger: { base: "#d0444a", on: "#ffffff", soft: "#2a1214", onSoft: "#ff8a8f", line: "#5c2427", edge: "#ff8a8f", deep: "#b0353b", dusk: "#6e1a1e", bright: "#ffadb1", vivid: "#e9505a", glow: "rgba(208, 68, 74, 0.3)" },
        warning: { base: "#f0b44c", on: "#1c1c1c", soft: "#2a2010", onSoft: "#f0b44c", line: "#5a4417", edge: "#f0b44c", deep: "#c98a1f", dusk: "#6b4100", bright: "#f6c873", vivid: "#f5a623", glow: "rgba(240, 180, 76, 0.26)" },
        info: { base: "#3a7fe0", on: "#ffffff", soft: "#101c2e", onSoft: "#7fb0ff", line: "#1f3b63", edge: "#7fb0ff", deep: "#2b66bd", dusk: "#10335f", bright: "#a6c8ff", vivid: "#2d9ee6", glow: "rgba(58, 127, 224, 0.3)" },
        neutral: { base: "#8a8b8f", on: "#000000", soft: "#262728", onSoft: "#ffffff", line: "#2b2b2c", edge: "#5c5d61", deep: "#d4d4d6", dusk: "#ffffff", bright: "#5c5d61", vivid: "#8e9297", glow: "rgba(0, 0, 0, 0.4)" },
    },
    state: {
        press: "rgba(255, 255, 255, 0.06)",
        selected: "#262728",
        numb: 0.4,
        quiet: 0.72,
        veil: "rgba(10, 10, 10, 0.6)",
    },
    photo: {
        dim: "rgba(0, 0, 0, 0.08)",
        dusk: "rgba(0, 0, 0, 0.36)",
        band: "rgba(0, 0, 0, 0.5)",
        chip: "rgba(17, 17, 17, 0.56)",
        chipEdge: "rgba(255, 255, 255, 0.24)",
        dot: "rgba(255, 255, 255, 0.6)",
    },
    shimmer: {
        glare: "rgba(255, 255, 255, 0.09)",
        sheen: "rgba(255, 255, 255, 0.07)",
        clear: "rgba(255, 255, 255, 0)",
    },
    terrain: {
        land: "#141414",
        road: "#242424",
        curb: "#1f1f1f",
        highway: "#2c2c2c",
        border: "#3a3a3a",
        water: "#0f1c2a",
        green: "#10231a",
        label: "#8f8f8f",
    },
    chat: {
        wallTop: "#000000",
        wallBottom: "#000000",
        doodle: "rgba(63, 208, 180, 0.09)",
        mine: "#1f4a42",
        mineMeta: "#8fbfb5",
        theirs: "#202222",
        glass: "rgba(30, 31, 32, 0.94)",
        stamp: "rgba(255, 255, 255, 0.12)",
    },
    cast: {
        lift: [],
        raise: [ cast(4, 20, "rgba(0, 0, 0, 0.5)") ],
        float: [ cast(8, 28, "rgba(0, 0, 0, 0.55)") ],
    },
    contact: "rgba(0, 0, 0, 0.6)",
    ceramic: {
        primary: { fill: "#087f6c", light: "#087f6c", shade: "#087f6c", glow: "rgba(8, 127, 108, 0)", rim: "rgba(255, 255, 255, 0)", ink: "#ffffff" },
        danger: { fill: "#d0444a", light: "#d0444a", shade: "#d0444a", glow: "rgba(208, 68, 74, 0)", rim: "rgba(255, 255, 255, 0)", ink: "#ffffff" },
        featured: { fill: "#262728", light: "#262728", shade: "#262728", glow: "rgba(0, 0, 0, 0)", rim: "rgba(255, 255, 255, 0)", ink: "#ffffff" },
        pebble: { fill: "#181819", light: "#181819", shade: "#181819", glow: "rgba(0, 0, 0, 0)", rim: "rgba(255, 255, 255, 0)", ink: "#ffffff" },
        knob: { fill: "#ffffff", light: "#ffffff", shade: "#ffffff", glow: "rgba(0, 0, 0, 0.4)", rim: "rgba(255, 255, 255, 0)", ink: "#000000" },
    },
    star: "#ffc53d",
};
