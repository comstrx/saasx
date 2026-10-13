import { describe, expect, test } from "bun:test";
import { createApi, requestContext } from "@engine/api";
import { isFailure } from "@engine/error";
import { core } from "../src/api/core/index.ts";
import { endpoints } from "../src/api/features/index.ts";
import { loadSpec, specFromEnvironment } from "../tools/core/index.ts";

const spec = await loadSpec(specFromEnvironment());
const api = spec.config.api;
const base = api?.connections.primary?.baseUrl ?? null;
const alive = base ? await fetch(`${base}/contract`, { headers: { "X-Tenant-Domain": api?.context.tenant ?? "" } }).then(( r ) => r.ok, () => false) : false;
const live = alive ? test : test.skip;

describe("the backend behind the spec", () => {
    live("its published envelope agrees with the core layer this part speaks", async () => {
        const reply = await fetch(`${base}/contract`, { headers: { Accept: "application/json", "X-Tenant-Domain": api?.context.tenant ?? "" } });
        const body = (await reply.json()) as { data: { envelope: Record<string, unknown> } };
        const envelope = body.data.envelope;
        const expected = core.response ?? {};

        for ( const key of ["data", "message", "errors", "code", "reason"] as const ) {
            expect(Object.keys(envelope)).toContain(expected[key] ?? key);
        }
    });
    live("a catalogue read decodes rows, pagination and the request id through the compiled contract", async () => {
        if ( !api ) return;

        const client = createApi(endpoints, api, spec.config.contract, () => requestContext(api.context, { language: "en", requestId: "live-1" }), { execution: "server" });
        const result = await client.catalogs.list({ limit: 3 });

        expect(result.resource.length).toBeGreaterThan(0);
        expect(result.resource[0]?.name).toBeString();
        expect(result.meta.pagination?.total).toBeGreaterThan(0);
        expect(result.meta.requestId).toBeString();
    });
    live("a refused sign-in is an input failure with the backend's reason", async () => {
        if ( !api ) return;

        const client = createApi(endpoints, api, spec.config.contract, () => requestContext(api.context, { language: "en", requestId: "live-2" }), { execution: "client" });

        const refusal = await client.auth.login({ email: "nobody@example.test", password: "Wrong#Password1" }).then(() => undefined, ( error: unknown ) => error);

        if ( isFailure(refusal) && refusal.status === 429 ) return;

        expect(refusal).toMatchObject({ kind: "input", reason: "invalid_credentials" });
    });
});
