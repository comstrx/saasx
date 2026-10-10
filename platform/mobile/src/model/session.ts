import type { SessionRow } from "@/api/endpoints/sessions";

export type Device = {
    id: number;
    name: string;
    agent: string;
    ip: string;
    mine: boolean;
    at: string | null;
    seenAt: string | null;
    expiresAt: string | null;
};

export const deviceOf = ( entry: SessionRow ): Device => ({
    id: entry.id,
    name: entry.name ?? "",
    agent: entry.agent ?? "",
    ip: entry.ip ?? "",
    mine: Boolean(entry.is_me),
    at: entry.created_at ?? null,
    seenAt: entry.last_used_at ?? null,
    expiresAt: entry.expires_at ?? null,
});

export type DeviceKind = "android" | "apple" | "windows" | "linux" | "chrome" | "browser" | "device";

const platforms: readonly ( readonly [ RegExp, DeviceKind ] )[] = [
    [ /edga?\/|opr\/|opera|firefox|fxios/i, "browser" ],
    [ /chrome|crios/i, "chrome" ],
    [ /safari/i, "browser" ],
    [ /okhttp|android/i, "android" ],
    [ /iphone|ipad|ipod|cfnetwork|darwin|mac os|macintosh/i, "apple" ],
    [ /windows/i, "windows" ],
    [ /linux/i, "linux" ],
];

export const deviceKind = ( device: Device ): DeviceKind =>
    platforms.find(([ test ]) => test.test(device.agent || device.name) )?.[1] ?? "device";

const engines: readonly ( readonly [ RegExp, string ] )[] = [
    [ /edga?\//i, "Edge" ],
    [ /opr\/|opera/i, "Opera" ],
    [ /chrome|crios/i, "Chrome" ],
    [ /firefox|fxios/i, "Firefox" ],
    [ /safari/i, "Safari" ],
];

const systems: readonly ( readonly [ RegExp, string ] )[] = [
    [ /android/i, "Android" ],
    [ /iphone|ipad|ipod|cfnetwork|darwin/i, "iOS" ],
    [ /windows/i, "Windows" ],
    [ /mac os|macintosh/i, "macOS" ],
    [ /linux/i, "Linux" ],
];

const shipped = /okhttp|expo|cfnetwork|darwin|dart/i;

const versioned = /\/\d/;

const named = ( agent: string, table: readonly ( readonly [ RegExp, string ] )[] ): string =>
    table.find(([ test ]) => test.test(agent) )?.[1] ?? "";

export const deviceLabel = ( device: Device, app: string, unknown: string ): string => {

    if ( device.name && !versioned.test(device.name) ) return device.name;

    const agent = device.agent || device.name;

    if ( !agent ) return unknown;

    const system = named(agent, systems);

    if ( shipped.test(agent) ) return system ? `${ app } · ${ system }` : app;

    const engine = named(agent, engines);

    if ( engine && system ) return `${ engine } · ${ system }`;

    return engine || system || unknown;

};

export const otherDevices = ( devices: readonly Device[] ): readonly Device[] =>
    devices.filter(( device ) => !device.mine );
