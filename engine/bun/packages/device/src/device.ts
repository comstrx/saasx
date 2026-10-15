import { Failure } from "engine/error";
import type { FileRef } from "engine/file";

export type Platform = "web" | "ios" | "android" | "unknown";
export type Permission = "location" | "camera" | "microphone" | "notifications" | "clipboard" | "contacts" | "photos";
export type Grant = "granted" | "denied" | "prompt" | "unsupported";
export type Screen = { width: number; height: number; scale: number };
export type Position = { latitude: number; longitude: number; accuracy: number; at: number };
export type Info = {
    platform: Platform;
    os: string;
    version: string;
    model: string | null;
    browser: string | null;
    language: string;
    languages: string[];
    timezone: string;
    online: boolean;
    touch: boolean;
    screen: Screen;
    colorScheme: "light" | "dark" | null;
    reducedMotion: boolean;
};
export type Watched = {
    online: boolean;
    colorScheme: "light" | "dark" | null;
    reducedMotion: boolean;
    screen: Screen;
    location: Position;
};
export type Watcher = <K extends keyof Watched>( fact: K, listener: ( value: Watched[K] ) => void ) => () => void;
export type Source = "camera" | "library";
export type Picked = Blob | FileRef;
export type Adapter = {
    info: () => Info;
    state: ( permission: Permission ) => Promise<Grant> | Grant;
    ask: ( permission: Permission ) => Promise<Grant>;
    watch: Watcher;
    open: ( target: "settings" | `${string}:${string}` ) => Promise<boolean>;
    pick: ( source: Source ) => Promise<Picked | null>;
    pushToken: () => Promise<string | null>;
    position: () => Promise<Position | null>;
};
export type Device = Adapter & {
    require: ( permission: Permission ) => Promise<void>;
    locate: ( timeoutMs?: number ) => Promise<Position>;
};

const locateTimeout = 15000;

export const unknownInfo: Info = {
    platform: "unknown",
    os: "unknown",
    version: "",
    model: null,
    browser: null,
    language: "",
    languages: [],
    timezone: "UTC",
    online: true,
    touch: false,
    screen: { width: 0, height: 0, scale: 1 },
    colorScheme: null,
    reducedMotion: false,
};

export function createDevice ( adapter: Partial<Adapter> ): Device {

    const info = adapter.info ?? (() => unknownInfo);
    const state = adapter.state ?? (() => "unsupported" as const);
    const ask = adapter.ask ?? (async ( permission ) => state(permission));
    const watch: Watcher = adapter.watch ?? (() => () => undefined);
    const open = adapter.open ?? (async () => false);
    const pick = adapter.pick ?? (async () => null);
    const pushToken = adapter.pushToken ?? (async () => null);
    const position = adapter.position ?? (async () => null);

    return {
        info,
        state,
        ask,
        watch,
        open,
        pick,
        pushToken,
        position,
        require: async ( permission ) => {

            const grant = await ask(permission);

            if ( grant !== "granted" ) throw new Failure("denied", { reason: `${permission}_${grant}` });

        },
        locate: ( timeoutMs = locateTimeout ) =>
            new Promise<Position>(( resolve, reject ) => {

                let off: () => void = () => undefined;
                let done = false;
                const settle = ( found: Position ) => {

                    if ( done ) return;

                    done = true;
                    clearTimeout(timer);
                    off();
                    resolve(found);

                };
                const timer = setTimeout(() => {

                    if ( done ) return;

                    done = true;
                    off();
                    reject(new Failure("timeout", { reason: "location_timeout" }));

                }, timeoutMs);

                void position().then(( known ) => {

                    if ( known ) settle(known);
                    else if ( !done ) off = watch("location", settle);

                });

            }),
    };

}
