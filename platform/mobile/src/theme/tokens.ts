import { PixelRatio } from "react-native";

export const radius = {
    pill: 999,
    tag: 6,
    item: 10,
    control: 12,
    pebble: 14,
    tile: 16,
    bar: 20,
    card: 16,
    panel: 16,
    sheet: 24,
} as const;

export const space = {
    "0": 0,
    "1": 4,
    "1.5": 6,
    "2": 8,
    "2.5": 10,
    "3": 12,
    "4": 16,
    "5": 20,
    "6": 24,
    "7": 32,
    "8": 40,
    "9": 48,
    "10": 64,
} as const;

export const stroke = {
    hair: PixelRatio.roundToNearestPixel(0.67),
    thin: 1,
    base: 1.5,
    rail: 3,
} as const;

export const control = {
    sm: { height: 38, gap: 6, pad: 14 },
    bar: { height: 44, gap: 8, pad: 12 },
    slim: { height: 40, gap: 8, pad: space["5"] },
    md: { height: 48, gap: 8, pad: 16, widePad: space["8"] },
    lg: { height: 56, gap: 10, pad: 20, widePad: space["9"] },
} as const;

export const tag = {
    sm: 20,
    md: 24,
} as const;

export const layer = {
    flat: 0,
    raised: 1,
    sticky: 10,
    overlay: 20,
    toast: 30,
    launch: 100,
} as const;

export const toggle = {
    check: 22,
    knob: 26,
    track: { width: 34, height: 14, knob: 20, ring: 2 },
} as const;

export const hit = {
    min: 44,
    slop: 10,
} as const;

export const icon = {
    xs: 12,
    sm: 15,
    md: 18,
    lg: 22,
    xl: 26,
} as const;

export const art = {
    sm: 64,
    md: 96,
    lg: 128,
    xl: 152,
} as const;

export const mark = { sm: 32, bar: 36, base: 38, md: 44, lg: 60 } as const;

export const ratio = {
    square: 1,
    photo: 1.34,
    wide: 1.6,
    detail: 0.85,
} as const;

export const material = {
    lit: "#ffffff",
    ink: "#000000",
    dim: 0.08,
    dusk: 0.36,
    veils: {
        hero: [ [ 0, 0.58 ], [ 0.55, 0.18 ], [ 1, 0 ] ],
        tile: [ [ 0, 0 ], [ 0.45, 0.06 ], [ 1, 0.74 ] ],
    },
} as const;

export const sheet = {
    reach: 0.88,
    dismiss: 92,
    fling: 780,
    travel: 900,
} as const;

const dockHeight = stroke.thin + space["3"] * 2 + control.md.height;

const floatHeight = space["2"] * 2 + control.md.height;

const thumb = 104;

export const layout = {
    dialog: 400,
    gutter: space["4"],
    dockInset: space["4"],
    dockBottom: space["3"],
    dockHeight,
    floatHeight,
    dockClearance: dockHeight + space["7"],
    lane: control.sm.height + space["2"] * 2,
    laneFloor: space["3"] + floatHeight + space["2"],
    thumb,
    section: space["6"],
    stack: space["3"],
} as const;

export const composition = {
    row: { pad: 18, lead: 16, glyph: 24, plate: 28, plateGap: 18, line: 50, padY: 12, padYTwo: 10, padYCheck: 12, split: 22 },
    group: { headTop: 15, notePad: 12, noteTop: 8 },
    menu: { row: 48, band: 8, pad: 8, width: 196, margin: 8, inset: 16, gap: 16, from: 0.88, step: 16, crown: 48 },
    crest: { avatar: 90, badge: 32, accolade: 64 },
    dialog: { avatar: 52, padY: 9, gap: 8, dot: 14 },
    bubble: { radius: 17, head: 46, face: 40, gap: 4, tile: 240 },
    composer: { bar: 44, key: 44, disc: 38, inset: 3, floor: 10, field: 140 },
    profile: { top: 35, acts: 26, act: 54, actGap: 7, after: 18, gap: 14, sign: 52, grid: 2 },
    detail: { section: space["7"], bar: space["1"] },
    launcher: { calendar: 360, drop: 120 },
    order: { art: 88 },
    devices: { art: 120, face: 42, gap: 14, pad: 16, padY: 10 },
    capsule: { pad: 4, seat: 28, tall: 44, padX: 14 },
    member: { avatar: 64 },
    wallet: { art: 72, deed: control.lg.height },
    service: { art: 52, rowArt: 40, bannerArt: 72, bannerTint: 0.055 },
    field: { helperOffset: 2 },
    otp: { cell: control.lg.height },
    separator: { size: control.sm.height },
    segment: { padX: space["1"], padY: space["1"], itemHeight: control.md.height - space["1"] * 2 },
    launch: {
        figure: 88, wordmark: mark.sm, gap: space["7"], footerInset: space["7"],
        glow: 320, glowOpacity: 0.12, accent: 176, accentOffset: 64, accentOpacity: 0.06,
        shadowHeight: 20, shadowOpacity: 0.16,
    },
    authScene: {
        figure: 0.8, glow: 0.96 * 1.1, glowCore: 0.42, glowTint: { day: 0.38, night: 0.4 },
        rays: [ -55, 55, 145, 235 ],
        ray: { width: 0.1, height: 0.62, offset: 0.35, opacity: 0.11 },
    },
    fireflies: {
        light: { day: 0.18, night: 0.3 },
        motes: [
            { x: -0.43, y: -0.21, size: 34, tone: "brand", delay: 0 },
            { x: 0.4, y: -0.32, size: 27, tone: "accent", delay: 900 },
            { x: 0.44, y: 0.26, size: 22, tone: "brand", delay: 1800 },
            { x: -0.31, y: 0.36, size: 18, tone: "accent", delay: 2600 },
        ],
    },
    storyScene: { figure: 0.96, glowScale: 0.8 },
    navigation: { height: floatHeight, icon: 22, pad: space["1"], padX: space["2.5"], gap: 2, indicator: { width: 52, height: 30 } },
    picker: { flagWidth: 28.8 },
    flag: { shadow: { day: [ { offsetX: 0, offsetY: 1, blurRadius: 3, color: "rgba(0, 0, 0, 0.1)" } ], night: [ { offsetX: 0, offsetY: 1, blurRadius: 3, color: "rgba(0, 0, 0, 0.2)" } ] } },
    search: { cardMin: 150, columnsMax: 2 },
    commerce: { thumbnail: 80 },
    domains: { width: 60, tile: 52, figure: 27.72 },
    empty: { maxWidth: 304, figure: 104, compactFigure: 80, copyWidth: "92%" },
    moment: { stage: 128, halo: 104, figure: 80 },
    discovery: { gap: space["4"], section: 28, band: space["5"] },
    rail: { min: 168, max: 224, visible: 1.8 },
    offer: { min: 264, max: 340, share: 0.86, art: 84, height: 172 },
    offers: { hero: 112, aura: 132 },
    scene: { compact: 112, full: 176 },
    story: { artShare: 0.86, artMax: 340, artHeightShare: 0.4, visible: 60, copyWidth: "90%" },
} as const;
