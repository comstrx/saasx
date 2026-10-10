import type Pusher from "../../lib/providers/realtime.ts";
import type { Options as PusherOptions } from "../../lib/providers/realtime.ts";
import type { ApiClient } from "./client.ts";
import type { LiveTopic, RealtimeConfig } from "./config.ts";
import { ApiError } from "./error.ts";

export type Socket = { scheme: "http" | "https"; host: string; port: number; key: string };

type Settings = RealtimeConfig & Socket;

type Listener = {
    channel: string;
    event: string;
    receive: ( payload: unknown ) => void;
    status?: ( connected: boolean ) => void;
};
type Pool = {
    client: Pusher | null;
    listeners: Set<Listener>;
    abort: AbortController;
    closed: boolean;
};
type Options = {
    userId: number;
    entityId?: number;
    signal?: AbortSignal;
    onEvent: ( payload: unknown ) => void;
    onStatus?: ( connected: boolean ) => void;
};

type Handle = { removed: boolean; close: () => void };
type Authorize = Extract<NonNullable<PusherOptions["channelAuthorization"]>, { customHandler: unknown }>["customHandler"];

const connections = new Map<string, Pool>();
const transports: NonNullable<PusherOptions["enabledTransports"]> = ["ws", "wss"];

function detach ( key: string, pool: Pool, entry: Listener ): void {

    pool.listeners.delete(entry);
    pool.client?.channel(entry.channel)?.unbind(entry.event, entry.receive);

    if ( ![...pool.listeners].some(( item ) => item.channel === entry.channel) ) pool.client?.unsubscribe(entry.channel);
    if ( pool.listeners.size ) return;

    pool.closed = true;
    pool.abort.abort();
    pool.client?.unbind_all();
    pool.client?.connection.unbind_all();
    pool.client?.disconnect();
    pool.client = null;

    if ( connections.get(key) === pool ) connections.delete(key);

}
function authorizer ( pool: Pool, api: ApiClient ): Authorize {

    return ( params, callback ) => {

        api.broadcast.authorize({ socket_id: params.socketId, channel_name: params.channelName }, { signal: pool.abort.signal })
            .then(( result ) => { if ( !pool.closed ) callback(null, result.resource); })
            .catch(() => { if ( !pool.closed ) callback(new Error("Channel authorization failed."), null); });

    };

}
function clientOptions ( settings: Settings, pool: Pool, api: ApiClient ): PusherOptions {

    return {
        cluster: "",
        wsHost: settings.host,
        wsPort: settings.port,
        wssPort: settings.port,
        forceTLS: settings.scheme === "https",
        enabledTransports: transports,
        enableStats: false,
        channelAuthorization: { transport: "ajax", endpoint: "", customHandler: authorizer(pool, api) },
    };

}
function announce ( pool: Pool, connected: boolean ): void {

    for ( const item of pool.listeners ) {

        item.status?.(connected);

    }

}
function bind ( pool: Pool, client: Pusher ): void {

    pool.client = client;
    client.connection.bind("state_change", ( state: { current: string } ) => announce(pool, state.current === "connected"));

    for ( const item of pool.listeners ) {

        client.subscribe(item.channel).bind(item.event, item.receive);

    }

}
async function start ( pool: Pool, settings: Settings, api: ApiClient ): Promise<void> {

    try {

        const { default: Client } = await import("../../lib/providers/realtime.ts");

        if ( pool.closed ) return;

        bind(pool, new Client(settings.key, clientOptions(settings, pool, api)));

    }
    catch {

        announce(pool, false);

    }

}
function channelName ( template: string, options: Options ): string {

    return template.replace(/\{(userId|entityId)\}/g, ( _: string, name: string ) => {

        const value = name === "userId" ? options.userId : options.entityId;

        if ( !Number.isSafeInteger(value) || !value || value < 1 ) throw new ApiError("input");

        return String(value);

    });

}
function join ( key: string, entry: Listener ): Pool {

    const existing = connections.get(key);
    const pool: Pool = existing ?? { client: null, listeners: new Set(), abort: new AbortController(), closed: false };

    connections.set(key, pool);
    pool.listeners.add(entry);

    if ( existing?.client ) {

        existing.client.subscribe(entry.channel).bind(entry.event, entry.receive);
        entry.status?.(existing.client.connection.state === "connected");

    }

    return pool;

}
function release ( key: string, pool: Pool, entry: Listener, signal: AbortSignal | undefined, handle: Handle ): void {

    if ( handle.removed ) return;

    handle.removed = true;
    signal?.removeEventListener("abort", handle.close);

    detach(key, pool, entry);

}
export function subscribe (
    config: RealtimeConfig,
    socket: Socket | undefined,
    api: ApiClient,
    auth: string | undefined,
    topic: LiveTopic,
    options: Options,
): () => void {

    const binding = config.channels[topic];

    if ( !auth || options.signal?.aborted || !socket || !binding ) return () => {};

    const settings: Settings = { ...config, ...socket };
    const key = JSON.stringify([settings, auth]);
    const entry: Listener = {
        channel: channelName(binding.channel, options),
        event: binding.event,
        receive: options.onEvent,
        status: options.onStatus,
    };
    const fresh = !connections.has(key);
    const pool = join(key, entry);
    const handle: Handle = { removed: false, close: () => release(key, pool, entry, options.signal, handle) };

    if ( fresh ) void start(pool, settings, api);

    options.signal?.addEventListener("abort", handle.close, { once: true });

    if ( options.signal?.aborted ) handle.close();

    return handle.close;

}
