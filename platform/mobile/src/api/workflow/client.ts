import { type ApiClient, createApi, requestContext } from "@engine/api";
import { observeCall, trace } from "../../lib/observe/client.ts";
import { client, config } from "../../lib/spec/runtime.ts";
import { type Endpoints, endpoints } from "../features/index.ts";

type Session = () => string | null;
type Denied = () => void;

export function appApi ( locale: string, session: Session, denied?: Denied ): ApiClient<Endpoints> {
    const api = client?.api ?? { context: { spec: config.settings.app.slug, currency: config.settings.currency.default, sessionCookie: null, proxies: 0, tenant: null }, connections: {} };
    const contract = client?.contract ?? config.contract;

    return createApi(endpoints, api, contract, () => requestContext(api.context, { language: locale, auth: session() ?? undefined, requestId: trace }), { execution: "client", observe: observeCall, onFailure: ( failure ) => { if ( failure.status === 401 && session() ) denied?.(); } });
}
