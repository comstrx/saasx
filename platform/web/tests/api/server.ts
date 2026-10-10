import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { list } from "../../src/api/core/fields.ts";
import { headerDefaults } from "../../src/api/core/wire.ts";
import policy from "../../src/api/features/policy.ts";
import { uploadLimits } from "../../src/lib/std/form.ts";
import { pathGet } from "../../src/lib/std/object.ts";
import { coreApi, failure, harness, invoke } from "../core/backend.ts";

type Limits = { uploads: { max_bytes: number; policies: Record<string, { max_count: number }> }; limits: { request_max_bytes: number }; channels: { realtime: Record<string, unknown> } };
type Server = {
    routes: string[];
    contract: Limits & {
        codes: { code: string; http: number }[];
        reasons: string[];
        query: string[];
        vocabulary: Record<string, string[]>;
        password: Record<string, unknown>;
        idempotency: { header: string; body_key: string; required_on: string[] };
    };
};

const server = JSON.parse(readFileSync(new URL("./server.json", import.meta.url), "utf8")) as Server;
const { api, contract } = coreApi();

function published ( method: string, path: string ): boolean {

    const segments = path.split("/");

    return server.routes.some(( route ) => {

        const [verb = "", uri = ""] = route.split(" ");
        const parts = uri.split("/");

        return verb === method && parts.length === segments.length && parts.every(( part, index ) => part === "{}" || part === segments[index]);

    });

}
function wirePath ( connection: string, path: string ): string {

    const base = new URL(api.connections[connection]?.baseUrl ?? "https://unknown.test").pathname.replace(/\/$/, "");

    return `${base}${path}`.replace(/\{[^}]+\}/g, "{}").replace(/\/$/, "") || "/";

}
test("every enabled operation answers to a route the server publishes", () => {

    const strays: string[] = [];

    for ( const [feature, operations] of Object.entries(contract.features) ) {

        for ( const [operation, wire] of Object.entries(operations) ) {

            if ( wire.enabled && !published(wire.method, wirePath(wire.connection, wire.path)) ) strays.push(`${feature}.${operation}`);

        }

    }

    assert.deepEqual(strays, []);

});
test("the list query the core emits belongs to the server's query DSL", () => {

    const keys = new Set(server.contract.query.map(( key ) => key.replace(/\[(?:key)?\]$/, "")));

    assert.deepEqual(Object.keys(list).filter(( key ) => !keys.has(key)), []);
    assert.deepEqual(server.contract.vocabulary.sort_key?.filter(( key ) => !list.sort.safeParse(key).success), []);
    assert.deepEqual(server.contract.vocabulary.filter_key?.filter(( key ) => !list.filters.safeParse({ [key]: "1" }).success), []);
    assert.deepEqual(server.contract.vocabulary.rendition?.filter(( view ) => !list.view.safeParse(view).success), []);

});
test("every published refusal reaches the caller with its reason, code and status", async () => {

    const { client, state } = harness("client");
    const lost: string[] = [];
    const failures = server.contract.codes.filter(( code ) => code.http >= 400);

    for ( const [index, reason] of server.contract.reasons.entries() ) {

        const { code, http } = failures[index % failures.length] ?? { code: "validation", http: 422 };

        state.reply = { status: http, body: { status: false, code, reason, message: reason, data: null, errors: null, meta: {} } };

        const error = await failure(invoke(client, "orders", "list", {}));

        if ( error.reason !== reason || error.code !== code || error.status !== http ) lost.push(`${reason}/${code}/${http}`);

    }

    assert.deepEqual(lost, []);

});
test("the policy document reads every published limit instead of its fallback", async () => {

    const { client, state } = harness("server");
    const data = { uploads: server.contract.uploads, limits: server.contract.limits, password: server.contract.password, channels: server.contract.channels };
    const fields = Object.entries(policy.read.wire.response?.fields ?? {});

    state.reply = { status: 200, body: { status: true, data, meta: {} } };

    const read = (await invoke(client, "policy", "read", {})).resource as Record<string, unknown>;

    assert.ok(fields.length > 0);
    assert.deepEqual(fields.filter(( [, path] ) => pathGet(data, path) === undefined).map(( [key] ) => key), []);
    assert.deepEqual(fields.filter(( [key, path] ) => JSON.stringify(read[key]) !== JSON.stringify(pathGet(data, path))).map(( [key] ) => key), []);

});
test("the core upload ceiling never exceeds what the server accepts", () => {

    const { uploads, limits } = server.contract;

    assert.ok(uploadLimits.fileBytes <= uploads.max_bytes);
    assert.ok(uploadLimits.totalBytes < limits.request_max_bytes);
    assert.ok(uploadLimits.count <= (uploads.policies.default?.max_count ?? 0));

});
test("checkouts carry the idempotency key under the name the server reads", async () => {

    const { idempotency } = server.contract;
    const { client, calls } = harness("client");
    const header = headerDefaults?.idempotency;
    const checkout = { quote_token: "q", pay_type: "wallet" };

    assert.equal(typeof header === "string" ? header : header?.name, idempotency.header);
    assert.ok(idempotency.required_on.includes("checkout"));

    await invoke(client, "orders", "checkout", { productId: 9, ...checkout }).catch(() => undefined);
    await invoke(client, "cart", "checkout", { cartId: 2, ...checkout }).catch(() => undefined);
    await invoke(client, "cart", "checkoutAll", { items: [{ id: 2, ...checkout }] }).catch(() => undefined);
    await invoke(client, "orders", "pay", { orderId: 7, quote_token: "q", [idempotency.body_key]: "k1" }, { idempotencyKey: "k1" }).catch(() => undefined);

    assert.deepEqual(calls.map(( call ) => call.idempotent), [true, true, true, true]);

});
