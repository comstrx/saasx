import { sleep } from "engine/base";
import { Failure } from "engine/error";
import type { Logger } from "engine/log";

export type Status = "idle" | "connecting" | "open" | "closed" | "failed";
export type Listener = ( message: unknown ) => void;
export type Transport = {
    send: ( data: string ) => void;
    close: () => void;
};
export type Opener = (
    url: string,
    handlers: {
        open: () => void;
        message: ( data: string ) => void;
        close: ( code: number, reason: string ) => void;
        error: ( error: unknown ) => void;
    },
) => Transport;
export type Outcome = { call: string; ms: number; trace?: string | undefined; error?: Failure | undefined };
export type ConnectionOptions = {
    url: string;

    trace?: string | undefined;

    observe?: (( outcome: Outcome ) => void) | undefined;
    open?: Opener | undefined;
    retries?: number | undefined;
    backoffMs?: number | undefined;
    maxBackoffMs?: number | undefined;
    heartbeatMs?: number | undefined;
    ping?: (() => string) | undefined;
    logger?: Logger | undefined;
};
export type Connection = {
    readonly status: Status;
    connect: () => Promise<void>;
    close: () => void;
    send: ( data: string ) => void;
    onMessage: ( listener: Listener ) => () => void;
    onStatus: ( listener: ( status: Status ) => void ) => () => void;
};

const defaults = { retries: 5, backoffMs: 500, maxBackoffMs: 15_000, heartbeatMs: 25_000 };

type SocketLike = {
    onopen: (() => void) | null;
    onmessage: (( event: { data: unknown } ) => void) | null;
    onclose: (( event: { code: number; reason: string } ) => void) | null;
    onerror: (( event: unknown ) => void) | null;
    send: ( data: string ) => void;
    close: () => void;
};

function websocket ( url: string, handlers: Parameters<Opener>[1] ): Transport {

    const Socket = (globalThis as { WebSocket?: new (url: string) => SocketLike }).WebSocket;

    if ( !Socket ) throw new Failure("configuration", { message: "No WebSocket on this runtime." });

    const socket = new Socket(url);

    socket.onopen = () => handlers.open();
    socket.onmessage = ( event ) => handlers.message(String(event.data));
    socket.onclose = ( event ) => handlers.close(event.code, event.reason);
    socket.onerror = ( event ) => handlers.error(event);

    return { send: ( data ) => socket.send(data), close: () => socket.close() };

}
export function createConnection ( options: ConnectionOptions ): Connection {

    const { url, open = websocket, logger, trace, observe } = options;
    const retries = options.retries ?? defaults.retries;
    const backoffMs = options.backoffMs ?? defaults.backoffMs;
    const maxBackoffMs = options.maxBackoffMs ?? defaults.maxBackoffMs;
    const heartbeatMs = options.heartbeatMs ?? defaults.heartbeatMs;
    const messages = new Set<Listener>();
    const watchers = new Set<( status: Status ) => void>();
    let status: Status = "idle";
    let transport: Transport | undefined;
    let attempts = 0;
    let wanted = false;
    let heartbeat: ReturnType<typeof setInterval> | undefined;
    let since = 0;
    const report = ( call: string, error?: Failure ): void => {

        observe?.({ call, ms: Date.now() - since, trace, ...(error ? { error } : {}) });

    };
    const move = ( next: Status ): void => {

        status = next;

        for ( const watcher of watchers ) watcher(next);

    };
    const stopHeartbeat = (): void => {

        if ( heartbeat ) clearInterval(heartbeat);

        heartbeat = undefined;

    };
    const startHeartbeat = (): void => {

        stopHeartbeat();

        if ( options.ping && heartbeatMs > 0 )
            heartbeat = setInterval(() => transport?.send(options.ping?.() ?? ""), heartbeatMs);

    };
    const attempt = (): Promise<void> =>
        new Promise(( resolve, reject ) => {

            move("connecting");
            since = Date.now();
            transport = open(url, {
                open: () => {

                    attempts = 0;
                    move("open");
                    report("socket.open");
                    since = Date.now();
                    startHeartbeat();
                    resolve();

                },
                message: ( data ) => {

                    for ( const listener of messages ) listener(data);

                },
                close: ( code, reason ) => {

                    stopHeartbeat();
                    transport = undefined;

                    if ( !wanted ) {

                        if ( status !== "closed" ) move("closed");

                        return;

                    }

                    logger?.warn("socket.dropped", { code, reason, attempts });
                    report(
                        "socket.dropped",
                        new Failure("network", { reason: "socket_dropped", message: `${code} ${reason}` }),
                    );
                    void again().catch(reject);

                },
                error: ( error ) => {

                    logger?.warn("socket.error", { error });

                },
            });

        });
    const again = async (): Promise<void> => {

        if ( attempts >= retries ) {

            const error = new Failure("network", { reason: "socket_unreachable", message: url });

            move("failed");
            report("socket.failed", error);

            throw error;

        }

        attempts += 1;

        const delay = Math.min(maxBackoffMs, backoffMs * 2 ** (attempts - 1));

        await sleep(delay * (0.8 + Math.random() * 0.4));

        if ( wanted ) await attempt();

    };

    return {
        get status () {

            return status;

        },
        connect: async () => {

            wanted = true;
            attempts = 0;
            await attempt();

        },
        close: () => {

            const current = transport;

            wanted = false;
            transport = undefined;
            stopHeartbeat();
            current?.close();

            if ( status !== "closed" ) move("closed");

        },
        send: ( data ) => {

            if ( !transport || status !== "open" ) throw new Failure("network", { reason: "socket_closed" });

            transport.send(data);

        },
        onMessage: ( listener ) => {

            messages.add(listener);

            return () => messages.delete(listener);

        },
        onStatus: ( listener ) => {

            watchers.add(listener);

            return () => watchers.delete(listener);

        },
    };

}
