import { type ApiClient, type ApiConfig, type ApiSurface, allowed, type Catalogue, type Contract, createApi, missing, type Observer, type RequestOptions, requestContext } from "@engine/api";
import { type CompiledPort, fillInput, granted, type Pagination, type Route } from "@engine/spec";
import type { Store } from "@engine/storage";
import { useCallback, useMemo } from "react";
import { createOutbox, type Outbox } from "./outbox.ts";
import { forgetPorts, type Input, type PortCache, type PortLive, type Queued, useOperation, usePortResource, type Written } from "./ports.ts";
import { type Binding, bind, type Resource, type Runner } from "./react.ts";
import { defineSession, type Session, type SessionActions } from "./session.ts";
import { bindSignals, type SignalBinding } from "./signals.ts";
import type { Defined } from "./store.ts";

export type ClientDoors<C extends Catalogue> = {
    identity: string;
    endpoints: C;
    api: { api: ApiConfig | null; contract: Contract };
    locales: readonly string[];
    useLocale: () => string;
    stores: { session: Store; persistent: Store };
    answers: number;
    site: () => unknown;
    trace: string;
    realtime?: { url: string; key: string } | null | undefined;
    host?: (() => string | undefined) | undefined;
    observe?: Observer | undefined;
};
export type Access = "pending" | "granted" | "denied";
export type Permission = { allowed: boolean; missing: readonly string[]; ready: boolean };
export type Write = Runner<Input, Written | Queued, RequestOptions> & Permission & { queued: boolean };
export type Client<C extends Catalogue> = {
    identity: string;
    locales: readonly string[];
    useLocale: () => string;
    sessionStore: Defined<Session, SessionActions>;
    session: Binding<Session, SessionActions>;
    signals: SignalBinding;
    outboxOf: ( owner: string | number | null | undefined ) => Outbox;
    useOutbox: () => Outbox;
    portCache: PortCache;
    live: PortLive | undefined;
    forgetAnswers: () => void;
    useSession: () => Session & SessionActions & { ready: boolean };
    useApi: () => ApiClient<C>;
    useAccess: ( access: readonly string[] ) => Access;
    usePermission: ( port: CompiledPort | undefined ) => Permission;
    usePort: ( port: CompiledPort | undefined, route: Route ) => Resource<unknown, Pagination>;
    useWrite: ( port: CompiledPort | undefined, route?: Route, options?: { queue?: boolean | undefined } ) => Write;
};

const nowhere: Route = { parameters: {}, query: {} };

function liveOf ( doors: { realtime?: { url: string; key: string } | null | undefined; trace: string; observe?: Observer | undefined } ): PortLive | undefined {

    const { realtime, trace, observe } = doors;

    if ( !realtime || typeof WebSocket === "undefined" ) return undefined;

    let source: Promise<PortLive> | undefined;
    const open = (): Promise<PortLive> => {

        source ??= import("@engine/socket").then(( socket ) => socket.liveSource(socket.pusherRealtime(socket.createConnection({ url: socket.pusherUrl(realtime.url, realtime.key, "engine", trace), trace, observe }))));

        return source;

    };

    return {
        subscribe: ( channel, events, handler ) => {

            let stop: (() => void) | undefined;
            let closed = false;

            void Promise.resolve().then(() => {

                if ( !closed ) return open().then(( live ) => { if ( !closed ) stop = live.subscribe(channel, events, handler); });

                return undefined;

            });

            return () => {

                closed = true;
                stop?.();

            };

        },
    };

}
export function defineClient<const C extends Catalogue> ( doors: ClientDoors<C> ): Client<C> {

    const { identity, endpoints, api, locales, useLocale, stores, site, trace, observe } = doors;
    const portCache: PortCache = { store: stores.persistent, ttl: doors.answers, prefix: `${identity}.port` };
    const boxes = new Map<string, Outbox>();
    const outboxOf = ( owner: string | number | null | undefined ): Outbox => {

        const name = owner === null || owner === undefined ? "guest" : `user:${owner}`;
        const box = boxes.get(name) ?? createOutbox({ store: stores.persistent, key: `${identity}.outbox.${name}` });

        boxes.set(name, box);

        return box;

    };
    const forgetAnswers = (): void => { void forgetPorts(portCache); };
    const sessionStore = defineSession({ name: `${identity}.session`, store: stores.session, onEnd: forgetAnswers });
    const session = bind(sessionStore);
    const signals = bindSignals();
    const live = liveOf(doors);
    const fallback = locales[0] ?? "en";
    const settings: ApiConfig = api.api ?? { context: { spec: identity, currency: "", sessionCookie: null, proxies: 0, tenant: null }, connections: {} };

    function useSession (): Session & SessionActions & { ready: boolean } {

        return session.useSelect(( state ) => state);

    }
    function useApi (): ApiClient<C> {

        const locale = useLocale();
        const { token, end } = useSession();

        return useMemo(() => {

            const language = locales.includes(locale) ? locale : fallback;

            return createApi(endpoints, settings, api.contract, () => requestContext(settings.context, { language, host: doors.host?.(), auth: token ?? undefined, requestId: trace }), {
                execution: "client",
                observe,
                onFailure: ( failure ) => { if ( failure.status === 401 && token ) end(); },
            });

        }, [locale, token, end]);

    }
    function useOutbox (): Outbox {

        return outboxOf(useSession().user?.id);

    }
    function useAccess ( access: readonly string[] ): Access {

        const current = useSession();

        if ( !current.ready ) return "pending";

        return granted(current.user, access) ? "granted" : "denied";

    }
    function usePermission ( port: CompiledPort | undefined ): Permission {

        const { ready, user } = useSession();
        const needed = port?.kind === "write" ? port.permissions : [];

        return { ready, allowed: allowed(user, needed), missing: missing(user, needed) };

    }
    function usePort ( port: CompiledPort | undefined, route: Route ): Resource<unknown, Pagination> {

        const locale = useLocale();
        const { user } = useSession();
        const values = signals.useSignals();

        return usePortResource(useApi() as ApiSurface, port, { ...route, signals: values }, site, [locale, user?.id ?? null], { cache: portCache, live });

    }
    function useWrite ( port: CompiledPort | undefined, route: Route = nowhere, { queue = false }: { queue?: boolean | undefined } = {} ): Write {

        const values = signals.useSignals();
        const permission = usePermission(port);
        const outbox = useOutbox();
        const runner = useOperation(useApi() as ApiSurface, port, queue ? outbox : undefined);
        const bound = port?.kind === "write" ? port.input : {};
        const filled = JSON.stringify(fillInput(bound, { ...route, signals: values }));
        const run = useCallback(( input: Input, options?: RequestOptions ) => runner.run({ ...(JSON.parse(filled) as Input), ...input }, options), [runner.run, filled]);
        const queued = runner.status === "done" && runner.result?.meta.source === "queued";

        return { ...runner, ...permission, run, queued };

    }
    return { identity, locales, useLocale, sessionStore, session, signals, outboxOf, useOutbox, portCache, live, forgetAnswers, useSession, useApi, useAccess, usePermission, usePort, useWrite };

}
