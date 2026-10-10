import assert from "node:assert/strict";
import { test } from "node:test";
import { requestContext, requestHeaders, resolveTenant } from "../../src/api/core/request.ts";
import { attempt, backend, coreApi, failure, harness, invoke, rejected, values } from "../core/backend.ts";

const { api, contract } = coreApi();
const wire = contract.features.products?.list;

if ( !wire?.enabled ) throw new Error("products.list must be enabled in the core contract.");

const mapping = wire.request.headers;

test("the tenant is the host of the request, lowercased and without its port", () => {

    assert.equal(resolveTenant("Shop.Example.test:443"), "shop.example.test");
    assert.equal(resolveTenant("localhost:3001"), "localhost");

    for ( const host of [undefined, "", "a..b", "shop.example.test/../x", ".example.test"] ) {

        assert.equal(rejected(() => resolveTenant(host)).status, 400);

    }

});
test("headers carry exactly the mapped context and refuse a context missing a required value", () => {

    const context = requestContext(api.context, values);
    const headers = requestHeaders(mapping, context);
    const forwarded = requestContext(api.context, { ...values, client: "203.0.113.7" });

    assert.deepEqual(Object.fromEntries(headers), {
        accept: "application/json",
        authorization: "Bearer token-1",
        locale: "ar",
        "x-currency": "SAR",
        "x-tenant-domain": "shop.example.test",
    });
    assert.equal(rejected(() => requestHeaders(mapping, { ...context, language: undefined })).kind, "input");
    assert.equal(requestHeaders(mapping, { ...context, auth: undefined }).has("authorization"), false);
    assert.equal(requestHeaders(mapping, forwarded).get("x-front-visitor"), "203.0.113.7");

});
test("the context falls back to the configured currency when the request carries junk", () => {

    assert.equal(requestContext(api.context, { ...values, currency: "usd" }).currency, "USD");
    assert.equal(requestContext(api.context, { ...values, currency: undefined }).currency, "USD");
    assert.equal(requestContext(api.context, values).currency, "SAR");

});
test("idempotency: mutations always carry a key, an explicit key wins, and a conflicting body key is refused", async () => {

    const { client, calls } = harness("client", {}, backend);

    await attempt(invoke(client, "orders", "quote", { orderId: 7 }));
    await attempt(invoke(client, "orders", "pay", { orderId: 7, quote_token: "q", gateway_id: 1, idempotency_key: "k1" }));
    await attempt(invoke(client, "orders", "list", {}));

    assert.equal(calls[0]?.idempotent, true);
    assert.equal(calls[1]?.idempotent, true);
    assert.equal(calls[2]?.idempotent, false);

    const conflict = invoke(client, "orders", "pay", { orderId: 7, quote_token: "q", gateway_id: 1, idempotency_key: "k1" }, { idempotencyKey: "k2" });

    assert.equal((await failure(conflict)).kind, "input");

});
