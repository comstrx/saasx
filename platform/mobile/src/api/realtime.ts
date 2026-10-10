import Echo from "laravel-echo";
import Pusher from "pusher-js/react-native";
import { AppState } from "react-native";
import { credentials, origin } from "@/api/client";

type Socket = Echo<"reverb">;

export type RealtimeSettings = {
    key: string;
    host: string;
    port: number;
    scheme: "http" | "https";
};

export type ChannelKind = "private" | "presence";

type Subscription = {
    channel: string;
    event: string;
    kind: ChannelKind;
    handler: ( payload: unknown ) => void;
};

const EchoClient = ( Echo as unknown as { default?: typeof Echo } ).default ?? Echo;
const PusherClient = ( Pusher as unknown as { Pusher?: typeof Pusher } ).Pusher ?? Pusher;

let socket: Socket | null = null;

let settings: RealtimeSettings = {
    key: process.env.EXPO_PUBLIC_REVERB_KEY ?? "",
    host: process.env.EXPO_PUBLIC_REVERB_HOST ?? "",
    port: Number(process.env.EXPO_PUBLIC_REVERB_PORT ?? 443),
    scheme: process.env.EXPO_PUBLIC_REVERB_SCHEME === "http" ? "http" : "https",
};

const watchers = new Set<() => void>();
const subscriptions = new Set<Subscription>();

const tune = ( live: Socket, entry: Subscription ) => entry.kind === "presence" ? live.join(entry.channel) : live.private(entry.channel);

const bind = ( live: Socket, entry: Subscription ) => tune(live, entry).listen(entry.event, entry.handler);

export const ready = () => Boolean(settings.key && settings.host);

export const watch = ( watcher: () => void ) => {

    watchers.add(watcher);

    return () => { watchers.delete(watcher); };

};

export function connect (): Socket | null {

    if ( !ready() ) return null;
    if ( socket ) return socket;

    socket = new EchoClient({
        broadcaster: "reverb",
        client: new PusherClient(settings.key, {
            cluster: "",
            wsHost: settings.host,
            wsPort: settings.port,
            wssPort: settings.port,
            forceTLS: settings.scheme === "https",
            enabledTransports: [ "ws", "wss" ],
            channelAuthorization: { transport: "ajax", endpoint: `${ origin() }/broadcasting/auth`, headersProvider: credentials },
        }),
    }) as Socket;

    for ( const entry of subscriptions ) bind(socket, entry);

    return socket;

}

function disconnect () {

    socket?.disconnect();
    socket = null;

}

export function configureRealtime ( patch: Partial<RealtimeSettings> ) {

    const next = { ...settings, ...patch };

    if ( next.key === settings.key && next.host === settings.host && next.port === settings.port && next.scheme === settings.scheme ) return;

    settings = next;
    disconnect();

    if ( subscriptions.size > 0 ) connect();

    for ( const watcher of watchers ) watcher();

}

export function onAlert ( channel: string, event: string, handler: ( payload: unknown ) => void, kind: ChannelKind = "private" ) {

    const entry = { channel, event, kind, handler };

    subscriptions.add(entry);

    if ( socket ) bind(socket, entry);

    return () => {

        subscriptions.delete(entry);

        if ( subscriptions.size === 0 ) { disconnect(); return; }
        if ( !socket ) return;

        const shared = [ ...subscriptions ].some(( other ) => other.channel === channel && other.kind === kind );

        if ( shared ) tune(socket, entry).stopListening(event, handler);
        else socket.leave(channel);

    };

}

AppState.addEventListener("change", ( status ) => {

    if ( status !== "active" ) disconnect();
    else if ( subscriptions.size > 0 ) connect();

});
