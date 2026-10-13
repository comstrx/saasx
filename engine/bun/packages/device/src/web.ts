import type {
    Adapter,
    Grant,
    Info,
    Permission,
    Picked,
    Platform,
    Position,
    Screen,
    Source,
    Watched,
} from "./device.ts";
import { unknownInfo } from "./device.ts";

type Query = {
    matches: boolean;
    addEventListener: ( type: "change", listener: () => void ) => void;
    removeEventListener: ( type: "change", listener: () => void ) => void;
};
type Coordinates = { latitude: number; longitude: number; accuracy: number };
type Geolocation = {
    getCurrentPosition: (
        ok: ( position: { coords: Coordinates; timestamp: number } ) => void,
        fail: ( error: { code: number } ) => void,
    ) => void;
    watchPosition: (
        ok: ( position: { coords: Coordinates; timestamp: number } ) => void,
        fail?: ( error: { code: number } ) => void,
    ) => number;
    clearWatch: ( id: number ) => void;
};
export type Host = {
    navigator?: {
        userAgent?: string;
        language?: string;
        languages?: readonly string[];
        onLine?: boolean;
        maxTouchPoints?: number;
        permissions?: { query: ( descriptor: { name: string } ) => Promise<{ state: string }> };
        geolocation?: Geolocation;
        mediaDevices?: {
            getUserMedia: (constraints: {
                video?: boolean;
                audio?: boolean;
            }) => Promise<{ getTracks: () => { stop: () => void }[] }>;
        };
        clipboard?: { readText: () => Promise<string> };
    };
    Notification?: { permission: string; requestPermission: () => Promise<string> };
    Intl?: { DateTimeFormat: () => { resolvedOptions: () => { timeZone?: string | undefined } } };
    matchMedia?: ( query: string ) => Query;
    innerWidth?: number;
    innerHeight?: number;
    devicePixelRatio?: number;
    addEventListener?: ( type: string, listener: () => void ) => void;
    removeEventListener?: ( type: string, listener: () => void ) => void;
    open?: ( url: string, target?: string ) => unknown;
    document?: { createElement: ( tag: "input" ) => FileInput };
};
type FileInput = {
    type: string;
    accept: string;
    capture: string;
    onchange: null | (() => void);
    oncancel?: null | (() => void);
    files: ArrayLike<Blob> | null;
    click: () => void;
};

const grants: Record<string, Grant> = { granted: "granted", denied: "denied", prompt: "prompt", default: "prompt" };
const names: Partial<Record<Permission, string>> = {
    location: "geolocation",
    camera: "camera",
    microphone: "microphone",
    notifications: "notifications",
    clipboard: "clipboard-read",
};

function platformOf ( agent: string ): { platform: Platform; os: string; version: string; browser: string | null } {

    const os = /Android (\d+(?:\.\d+)?)/.exec(agent)
        ? { os: "android", version: /Android (\d+(?:\.\d+)?)/.exec(agent)?.[1] ?? "" }
        : /iPhone OS (\d+)_(\d+)|iPad; CPU OS (\d+)_(\d+)/.exec(agent)
          ? { os: "ios", version: (/OS (\d+)_(\d+)/.exec(agent) ?? []).slice(1).join(".") }
          : /Windows NT (\d+\.\d+)/.exec(agent)
            ? { os: "windows", version: /Windows NT (\d+\.\d+)/.exec(agent)?.[1] ?? "" }
            : /Mac OS X (\d+[._]\d+)/.exec(agent)
              ? { os: "macos", version: (/Mac OS X (\d+[._]\d+)/.exec(agent)?.[1] ?? "").replace("_", ".") }
              : /Linux/.test(agent)
                ? { os: "linux", version: "" }
                : { os: "unknown", version: "" };
    const browser = /Edg\//.test(agent)
        ? "edge"
        : /OPR\//.test(agent)
          ? "opera"
          : /Chrome\//.test(agent)
            ? "chrome"
            : /Firefox\//.test(agent)
              ? "firefox"
              : /Safari\//.test(agent)
                ? "safari"
                : null;

    return { platform: "web", ...os, browser };

}
function screenOf ( host: Host ): Screen {

    return { width: host.innerWidth ?? 0, height: host.innerHeight ?? 0, scale: host.devicePixelRatio ?? 1 };

}
function schemeOf ( host: Host ): "light" | "dark" | null {

    if ( !host.matchMedia ) return null;

    return host.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";

}
function reducedOf ( host: Host ): boolean {

    return host.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;

}
function positionOf ( position: { coords: Coordinates; timestamp: number } ): Position {

    return {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        at: position.timestamp,
    };

}
function mediaQuery ( host: Host, query: string, listener: ( matches: boolean ) => void ): () => void {

    const media = host.matchMedia?.(query);

    if ( !media ) return () => undefined;

    const handler = () => listener(media.matches);

    media.addEventListener("change", handler);

    return () => media.removeEventListener("change", handler);

}
function hostEvents ( host: Host, types: readonly string[], listener: () => void ): () => void {

    for ( const type of types ) host.addEventListener?.(type, listener);

    return () => {

        for ( const type of types ) host.removeEventListener?.(type, listener);

    };

}
export function webAdapter ( host: Host = globalThis as Host ): Adapter {

    const navigator = host.navigator;
    const info = (): Info => ({
        ...unknownInfo,
        ...platformOf(navigator?.userAgent ?? ""),
        model: null,
        language: navigator?.language ?? unknownInfo.language,
        languages: [...(navigator?.languages ?? [navigator?.language ?? unknownInfo.language])],
        timezone: host.Intl?.DateTimeFormat().resolvedOptions().timeZone ?? unknownInfo.timezone,
        online: navigator?.onLine ?? true,
        touch: (navigator?.maxTouchPoints ?? 0) > 0,
        screen: screenOf(host),
        colorScheme: schemeOf(host),
        reducedMotion: reducedOf(host),
    });
    const state = async ( permission: Permission ): Promise<Grant> => {

        const name = names[permission];

        if ( !name ) return "unsupported";

        if ( permission === "notifications" && host.Notification )
            return grants[host.Notification.permission] ?? "prompt";

        if ( !navigator?.permissions ) return "prompt";

        try {

            return grants[(await navigator.permissions.query({ name })).state] ?? "prompt";

        } catch {

            return "unsupported";

        }

    };
    const ask = async ( permission: Permission ): Promise<Grant> => {

        if ( permission === "location" ) {

            if ( !navigator?.geolocation ) return "unsupported";

            return new Promise(( resolve ) =>
                navigator.geolocation?.getCurrentPosition(
                    () => resolve("granted"),
                    ( error ) => resolve(error.code === 1 ? "denied" : "granted"),
                ),
            );

        }

        if ( permission === "camera" || permission === "microphone" ) {

            if ( !navigator?.mediaDevices ) return "unsupported";

            try {

                const stream = await navigator.mediaDevices.getUserMedia(
                    permission === "camera" ? { video: true } : { audio: true },
                );

                for ( const track of stream.getTracks() ) track.stop();

                return "granted";

            } catch {

                return "denied";

            }

        }

        if ( permission === "notifications" ) {

            if ( !host.Notification ) return "unsupported";

            return grants[await host.Notification.requestPermission()] ?? "denied";

        }

        if ( permission === "clipboard" ) {

            if ( !navigator?.clipboard ) return "unsupported";

            try {

                await navigator.clipboard.readText();

                return "granted";

            } catch {

                return "denied";

            }

        }

        return "unsupported";

    };
    const watch: Adapter["watch"] = ( fact, listener ) => {

        const emit = listener as ( value: Watched[keyof Watched] ) => void;

        if ( fact === "online" ) return hostEvents(host, ["online", "offline"], () => emit(navigator?.onLine ?? true));

        if ( fact === "colorScheme" )
            return mediaQuery(host, "(prefers-color-scheme: dark)", ( dark ) => emit(dark ? "dark" : "light"));

        if ( fact === "reducedMotion" )
            return mediaQuery(host, "(prefers-reduced-motion: reduce)", ( reduced ) => emit(reduced));

        if ( fact === "screen" ) return hostEvents(host, ["resize", "orientationchange"], () => emit(screenOf(host)));

        const geolocation = navigator?.geolocation;

        if ( !geolocation ) return () => undefined;

        const id = geolocation.watchPosition(( position ) => emit(positionOf(position)));

        return () => geolocation.clearWatch(id);

    };
    const open = async ( target: string ): Promise<boolean> => {

        if ( target === "settings" || !host.open ) return false;

        return host.open(target, "_blank") !== null;

    };
    const pick = ( source: Source ): Promise<Picked | null> =>
        new Promise(( resolve ) => {

            const input = host.document?.createElement("input");

            if ( !input ) {

                resolve(null);

                return;

            }

            input.type = "file";
            input.accept = "image/*";
            input.capture = source === "camera" ? "environment" : "";
            input.onchange = () => resolve(input.files?.[0] ?? null);
            input.oncancel = () => resolve(null);
            input.click();

        });

    const position = (): Promise<Position | null> =>
        new Promise(( resolve ) => {

            const geolocation = navigator?.geolocation;

            if ( !geolocation ) {

                resolve(null);

                return;

            }

            geolocation.getCurrentPosition(
                ( found ) => resolve(positionOf(found)),
                () => resolve(null),
            );

        });

    return { info, state, ask, watch, open, pick, pushToken: async () => null, position };

}
