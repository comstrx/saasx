import { isRecord } from "engine/base";
import { Failure } from "engine/error";
import type { Connection } from "./connection.ts";

export type Event = { channel?: string | undefined; event: string; data: unknown };
export type Handler = ( data: unknown, event: string ) => void;
export type Authorizer = (
    channel: string,
    socketId: string,
) => Promise<{ auth: string; channel_data?: string | undefined }>;
export type Realtime = {
    connect: () => Promise<string>;
    socketId: () => string | undefined;
    subscribe: ( channel: string, handler: Handler ) => () => void;
    close: () => void;
};

type Frame = { event: string; channel?: string; data?: unknown };

function parse ( raw: unknown ): Frame | undefined {

    try {

        const frame = JSON.parse(String(raw)) as unknown;

        if ( !isRecord(frame) || typeof frame.event !== "string" ) return undefined;

        const data = typeof frame.data === "string" ? (JSON.parse(frame.data) as unknown) : frame.data;

        return { event: frame.event, ...(typeof frame.channel === "string" ? { channel: frame.channel } : {}), data };

    } catch {

        return undefined;

    }

}
export function pusherRealtime ( connection: Connection, authorize?: Authorizer ): Realtime {

    const handlers = new Map<string, Set<Handler>>();
    let socketId: string | undefined;
    let established: (( id: string ) => void) | undefined;
    const frame = ( event: string, data: Record<string, unknown> ): string => JSON.stringify({ event, data });
    const join = async ( channel: string ): Promise<void> => {

        const id = socketId;

        if ( !id ) return;

        const needs = channel.startsWith("private-") || channel.startsWith("presence-");
        const signed = needs && authorize ? await authorize(channel, id) : {};

        connection.send(frame("pusher:subscribe", { channel, ...signed }));

    };

    connection.onMessage(( raw ) => {

        const message = parse(raw);

        if ( !message ) return;

        if ( message.event === "pusher:connection_established" && isRecord(message.data) ) {

            socketId = String(message.data.socket_id ?? "");
            established?.(socketId);

            for ( const channel of handlers.keys() ) void join(channel);

            return;

        }

        if ( message.event === "pusher:ping" ) {

            connection.send(frame("pusher:pong", {}));

            return;

        }

        if ( message.event === "pusher:error" )
            throw new Failure("network", { reason: "socket_refused", message: JSON.stringify(message.data) });

        for ( const handler of handlers.get(message.channel ?? "") ?? [] ) handler(message.data, message.event);

    });

    return {
        connect: async () => {

            const ready = new Promise<string>(( resolve ) => {

                established = resolve;

            });

            await connection.connect();

            return ready;

        },
        socketId: () => socketId,
        subscribe: ( channel, handler ) => {

            const set = handlers.get(channel) ?? new Set<Handler>();

            handlers.set(channel, set);
            set.add(handler);

            if ( set.size === 1 ) void join(channel);

            return () => {

                set.delete(handler);

                if ( !set.size ) {

                    handlers.delete(channel);

                    if ( socketId && connection.status === "open" )
                        connection.send(frame("pusher:unsubscribe", { channel }));

                }

            };

        },
        close: () => connection.close(),
    };

}

export type LiveSource = {
    subscribe: (
        channel: string,
        events: readonly string[],
        handler: ( event: string, data: unknown ) => void,
    ) => () => void;
};

export function pusherUrl ( base: string, key: string, client = "engine", trace?: string ): string {

    const address = `${base.replace(/\/$/, "")}/app/${encodeURIComponent(key)}?protocol=7&client=${client}&version=1&flash=false`;

    return trace ? `${address}&trace=${encodeURIComponent(trace)}` : address;

}
export function liveSource ( realtime: Realtime ): LiveSource {

    let opened = false;

    return {
        subscribe: ( channel, events, handler ) => {

            if ( !opened ) {

                opened = true;
                void realtime.connect();

            }

            return realtime.subscribe(channel, ( data, event ) => {

                if ( !events.length || events.includes(event) ) handler(event, data);

            });

        },
    };

}
