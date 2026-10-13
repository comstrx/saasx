import { type ApiClient, createApi, requestContext } from "@engine/api";
import { uuid } from "@engine/base";
import { client, config } from "../../lib/spec/runtime.ts";
import { type Endpoints, endpoints } from "../features/index.ts";

type Session = () => string | null;

export function appApi ( locale: string, session: Session ): ApiClient<Endpoints> {

    const api = client?.api ?? { context: { spec: config.settings.app.slug, currency: config.settings.currency.default, sessionCookie: null, proxies: 0, tenant: null }, connections: {} };
    const contract = client?.contract ?? config.contract;

    return createApi(endpoints, api, contract, () => requestContext(api.context, { language: locale, auth: session() ?? undefined, requestId: uuid() }), { execution: "client" });

}
