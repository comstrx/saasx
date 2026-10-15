import { describe, expect, test } from "bun:test";
import { createDevice, type Host, webAdapter } from "engine/device";

function browser (): { host: Host; fire: ( type: string ) => void; flip: ( query: string, matches: boolean ) => void } {

    const listeners = new Map<string, Set<() => void>>();
    const queries = new Map<string, { matches: boolean; handlers: Set<() => void> }>();
    const on = ( type: string, listener: () => void ) => {

        listeners.set(type, (listeners.get(type) ?? new Set()).add(listener));

    };
    const host: Host = {
        navigator: {
            userAgent: "Mozilla/5.0 (Linux; Android 16; CPH2603) AppleWebKit/537.36 Chrome/142.0 Mobile Safari/537.36",
            language: "ar-EG",
            languages: ["ar-EG", "en"],
            onLine: true,
            maxTouchPoints: 5,
            permissions: { query: async ({ name }) => ({ state: name === "geolocation" ? "granted" : "prompt" }) },
            geolocation: {
                getCurrentPosition: ( ok ) =>
                    ok({ coords: { latitude: 30.04, longitude: 31.23, accuracy: 10 }, timestamp: 5 }),
                watchPosition: ( ok ) => {

                    ok({ coords: { latitude: 30.05, longitude: 31.24, accuracy: 8 }, timestamp: 6 });

                    return 1;

                },
                clearWatch: () => undefined,
            },
            mediaDevices: { getUserMedia: async () => Promise.reject(new Error("NotAllowedError")) },
        },
        Notification: { permission: "default", requestPermission: async () => "granted" },
        Intl: { DateTimeFormat: () => ({ resolvedOptions: () => ({ timeZone: "Africa/Cairo" }) }) },
        innerWidth: 412,
        innerHeight: 915,
        devicePixelRatio: 2.625,
        matchMedia: ( query ) => {

            const entry = queries.get(query) ?? { matches: query.includes("dark"), handlers: new Set() };

            queries.set(query, entry);

            return {
                get matches () {

                    return entry.matches;

                },
                addEventListener: ( _type, listener ) => entry.handlers.add(listener),
                removeEventListener: ( _type, listener ) => entry.handlers.delete(listener),
            };

        },
        addEventListener: on,
        removeEventListener: ( type, listener ) => listeners.get(type)?.delete(listener),
        open: () => ({}),
    };

    return {
        host,
        fire: ( type ) => {

            for ( const listener of listeners.get(type) ?? [] ) listener();

        },
        flip: ( query, matches ) => {

            const entry = queries.get(query);

            if ( !entry ) return;

            entry.matches = matches;

            for ( const handler of entry.handlers ) handler();

        },
    };

}
describe("device", () => {

    test("an empty adapter answers honestly and require fails as denied", async () => {

        const device = createDevice({});

        expect(device.info().platform).toBe("unknown");
        expect(await device.state("camera")).toBe("unsupported");
        expect(device.watch("online", () => undefined)()).toBeUndefined();
        await expect(device.require("location")).rejects.toMatchObject({
            kind: "denied",
            reason: "location_unsupported",
        });

    });
    test("the browser adapter reads the host's facts", () => {

        const info = createDevice(webAdapter(browser().host)).info();

        expect(info).toMatchObject({
            platform: "web",
            os: "android",
            version: "16",
            browser: "chrome",
            language: "ar-EG",
            languages: ["ar-EG", "en"],
            timezone: "Africa/Cairo",
            online: true,
            touch: true,
            screen: { width: 412, height: 915, scale: 2.625 },
            colorScheme: "dark",
            reducedMotion: false,
        });

    });
    test("permissions are queried and asked through the capability that owns them", async () => {

        const device = createDevice(webAdapter(browser().host));

        expect(await device.state("location")).toBe("granted");
        expect(await device.state("camera")).toBe("prompt");
        expect(await device.state("contacts")).toBe("unsupported");
        expect(await device.state("notifications")).toBe("prompt");
        expect(await device.ask("location")).toBe("granted");
        expect(await device.ask("camera")).toBe("denied");
        expect(await device.ask("notifications")).toBe("granted");
        expect(await device.ask("photos")).toBe("unsupported");
        await expect(device.require("camera")).rejects.toMatchObject({ kind: "denied", reason: "camera_denied" });

    });
    test("watchers follow host events and stop when released", () => {

        const page = browser();
        const device = createDevice(webAdapter(page.host));
        const seen: unknown[] = [];
        const offOnline = device.watch("online", ( online ) => seen.push(["online", online]));
        const offScheme = device.watch("colorScheme", ( scheme ) => seen.push(["scheme", scheme]));
        const offLocation = device.watch("location", ( position ) => seen.push(["location", position.latitude]));

        if ( page.host.navigator ) page.host.navigator.onLine = false;

        page.fire("offline");
        page.flip("(prefers-color-scheme: dark)", false);
        offOnline();
        offScheme();
        offLocation();
        page.fire("online");
        page.flip("(prefers-color-scheme: dark)", true);
        expect(seen).toEqual([
            ["location", 30.05],
            ["online", false],
            ["scheme", "light"],
        ]);

    });
    test("settings cannot open from a browser but a url can", async () => {

        const device = createDevice(webAdapter(browser().host));

        expect(await device.open("settings")).toBe(false);
        expect(await device.open("https://example.test")).toBe(true);

    });

});
describe("device capabilities", () => {

    test("locate answers the first watched position and the optional capabilities answer honestly", async () => {

        const device = createDevice({
            watch: (( fact: string, listener: ( value: unknown ) => void ) => {

                if ( fact === "location" ) listener({ latitude: 1, longitude: 2, accuracy: 3, at: 4 });

                return () => undefined;

            }) as never,
        });

        expect(await device.locate()).toEqual({ latitude: 1, longitude: 2, accuracy: 3, at: 4 });
        expect(await device.pick("library")).toBeNull();
        expect(await device.pushToken()).toBeNull();
        await expect(createDevice({}).locate(10)).rejects.toMatchObject({ kind: "timeout" });

    });
    test("the web adapter picks a file through a file input", async () => {

        const blob = new Blob(["x"], { type: "image/png" });
        const file = Object.assign(blob, { name: "a.png" });
        const input = {
            type: "",
            accept: "",
            capture: "",
            onchange: null as null | (() => void),
            files: [file],
            click: () => input.onchange?.(),
        };
        const device = createDevice(webAdapter({ document: { createElement: () => input } } as never));

        expect(await device.pick("camera")).toBe(file);
        expect(input.type).toBe("file");
        expect(input.accept).toBe("image/*");
        expect(input.capture).toBe("environment");

    });

});
describe("locate", () => {

    test("a one-shot position wins over the watcher, and the web adapter reads getCurrentPosition", async () => {

        const device = createDevice({
            position: async () => ({ latitude: 9, longitude: 8, accuracy: 1, at: 2 }),
            watch: (() => () => undefined) as never,
        });

        expect(await device.locate(10)).toEqual({ latitude: 9, longitude: 8, accuracy: 1, at: 2 });

        const web = createDevice(
            webAdapter({
                navigator: {
                    geolocation: {
                        getCurrentPosition: (
                            ok: (found: {
                                coords: { latitude: number; longitude: number; accuracy: number };
                                timestamp: number;
                            }) => void,
                        ) => ok({ coords: { latitude: 1, longitude: 2, accuracy: 3 }, timestamp: 4 }),
                        watchPosition: () => 1,
                        clearWatch: () => undefined,
                    },
                },
            } as never),
        );

        expect(await web.locate(10)).toEqual({ latitude: 1, longitude: 2, accuracy: 3, at: 4 });

        const silent = createDevice({ position: () => new Promise(() => undefined) });

        await expect(silent.locate(20)).rejects.toMatchObject({ kind: "timeout" });

    });

});
