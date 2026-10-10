import type { Point } from "./geo.ts";

export type Area = "local" | "session";
export type StoredValue =
    | { state: "stored"; value: unknown }
    | { state: "missing" | "invalid" | "unavailable"; value?: undefined };

export function media ( query: string ) {

    return {
        subscribe ( listener: () => void ) {

            const match = window.matchMedia(query);

            match.addEventListener("change", listener);
            return () => match.removeEventListener("change", listener);

        },
        getSnapshot: () => window.matchMedia(query).matches,
        getServerSnapshot: () => false,
    };

}
function area ( name: Area ): Storage | undefined {

    try {

        return name === "local" ? globalThis.localStorage : globalThis.sessionStorage;

    }
    catch {

        return undefined;

    }

}
export function storage ( name: Area ) {

    function inspect ( key: string ): StoredValue {

        try {

            const selected = area(name);

            if ( !selected ) return { state: "unavailable" };

            const raw = selected.getItem(key);

            if ( raw === null ) return { state: "missing" };

            try { return { state: "stored", value: JSON.parse(raw) as unknown }; }
            catch { return { state: "invalid" }; }

        }
        catch {

            return { state: "unavailable" };

        }

    }

    return {
        inspect,
        read ( key: string ): unknown {

            return inspect(key).value;

        },
        write ( key: string, value: unknown ): boolean {

            try {

                const selected = area(name);

                if ( !selected ) return false;

                if ( value === undefined || value === null ) {

                    selected.removeItem(key);
                    return selected.getItem(key) === null;

                }

                const encoded = JSON.stringify(value);

                selected.setItem(key, encoded);

                return selected.getItem(key) === encoded;

            }
            catch {

                return false;

            }

        },
    };

}
export function onFirstGesture ( run: () => void ): () => void {

    const controller = new AbortController();
    const fire = () => {

        controller.abort();
        run();

    };

    for ( const name of ["pointerdown", "keydown"] ) {

        window.addEventListener(name, fire, { passive: true, signal: controller.signal });

    }

    return () => controller.abort();

}
export function locate ( remember: ( location: Point | null ) => void ): void {

    navigator.geolocation.getCurrentPosition(
        ( { coords } ) => remember({ latitude: coords.latitude, longitude: coords.longitude }),
        ( error ) => { if ( error.code === error.PERMISSION_DENIED ) remember(null); },
        { maximumAge: 600000, timeout: 15000 },
    );

}
