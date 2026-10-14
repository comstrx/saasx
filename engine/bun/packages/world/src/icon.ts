export const iconAliases = {
    house: "house",
    grid: "layout-grid",
    key: "key-round",
    tag: "tag",
    sliders: "sliders-horizontal",
    plus: "plus",
    pencil: "pencil",
    trash: "trash",
    undo: "undo-2",
    user: "user-round",
    pin: "map-pin",
    camera: "camera",
    bell: "bell",
    search: "search",
    menu: "menu",
    circle: "circle",
    chevronStart: "chevron-left",
    chevronEnd: "chevron-right",
    check: "check",
    image: "image",
    empty: "inbox",
    failed: "cloud-alert",
    offline: "wifi-off",
    denied: "shield-x",
    done: "circle-check",
    smile: "smile",
} as const;

export type IconName = keyof typeof iconAliases;

export const iconNames = Object.keys(iconAliases) as IconName[];
export const iconCodes: Readonly<Record<IconName, number>> = {
    house: 0xe0f5,
    grid: 0xe0ff,
    key: 0xe4a3,
    tag: 0xe17f,
    sliders: 0xe29a,
    plus: 0xe13d,
    pencil: 0xe1f9,
    trash: 0xe18d,
    undo: 0xe2a1,
    user: 0xe468,
    pin: 0xe111,
    camera: 0xe064,
    bell: 0xe059,
    search: 0xe151,
    menu: 0xe115,
    circle: 0xe076,
    chevronStart: 0xe06e,
    chevronEnd: 0xe06f,
    check: 0xe06c,
    image: 0xe0f6,
    empty: 0xe0f7,
    failed: 0xe633,
    offline: 0xe1af,
    denied: 0xe200,
    done: 0xe226,
    smile: 0xe164,
};
export const iconMirrors: readonly IconName[] = ["chevronStart", "chevronEnd", "undo"];

export type Icons<I> = {
    readonly names: readonly string[];
    has: ( name: string ) => boolean;
    get: ( name: string ) => I;
};

export function createIcons<I> ( set: Readonly<Record<string, I>>, fallback: I ): Icons<I> {

    const names = Object.keys(set).sort();

    return {
        names,
        has: ( name ) => Object.hasOwn(set, name),
        get: ( name ) => (Object.hasOwn(set, name) ? (set[name] as I) : fallback),
    };

}

const codes: Readonly<Record<string, number>> = iconCodes;
const mirrored = new Set<string>(iconMirrors);

export function iconGlyph ( name: string ): string {

    return String.fromCodePoint(codes[name] ?? iconCodes.circle);

}
export function iconMirrored ( name: string ): boolean {

    return mirrored.has(name);

}
