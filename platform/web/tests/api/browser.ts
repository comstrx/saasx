import assert from "node:assert/strict";
import { test } from "node:test";
import { browserConfig, type ContractOverrides } from "../../src/api/core/resolve.ts";
import { resourceDefaults } from "../../src/api/core/resource.ts";
import { backend, coreApi, failure, harness, invoke } from "../core/backend.ts";

const internal = {
    ...backend,
    context: { ...backend.context, authCookie: "session" },
    connections: {
        ...backend.connections,
        primary: {
            ...backend.connections.primary,
            browserBaseUrl: "https://edge.example.test/v1",
            development: { baseUrl: "http://localhost:8000/v1", browserBaseUrl: null }
        },
        internal: {
            baseUrl: "https://internal.example.test"
        },
        vault: {
            baseUrl: "https://vault.example.test",
            browser: false,
        },
    },
};
const serverOnly: ContractOverrides = {
    features: {
        seo: {
            operations: {
                read: { enabled: true, path: "/seo/{path}", execution: "server", connection: "internal" }
            }
        },
        policy: true,
        locales: { operations: { list: true } },
        currencies: { operations: { list: { connection: "vault" } } },
    },
};

test("server-only operations run on the server and are refused on the client", async () => {

    const server = harness("server", serverOnly, internal);
    const client = harness("client", serverOnly, internal);

    await invoke(server.client, "seo", "read", { path: "home" });

    assert.equal(server.calls[0]?.connection, "internal");
    assert.equal(server.calls[0]?.path, "/seo/home");
    assert.equal((await failure(invoke(client.client, "seo", "read", { path: "home" }))).kind, "execution");

});
test("the browser projection leaks neither server-only wires, connections, cookies nor development endpoints", () => {

    const { api, contract } = coreApi(serverOnly, internal);
    const browser = browserConfig(api, contract);

    assert.deepEqual(browser.contract.features.seo?.read, { enabled: false, restricted: true });
    assert.deepEqual(browser.contract.values.seo, resourceDefaults("seo"));
    assert.deepEqual(browser.contract.features.policy?.read, { enabled: false, restricted: true });
    assert.deepEqual(browser.contract.values.policy, resourceDefaults("policy"));
    assert.deepEqual(Object.keys(browser.api.connections).sort(), ["broadcast", "primary", "vault"]);
    assert.equal(browser.api.connections.primary?.baseUrl, "https://edge.example.test/v1");
    assert.equal(browser.api.connections.vault?.baseUrl, null);
    assert.deepEqual(Object.keys(browser.api.connections.primary ?? {}).sort(), ["baseUrl", "credentials", "maxResponseBytes", "retries", "timeoutMs"]);
    assert.equal(contract.features.locales?.list?.enabled, true);
    assert.equal(contract.features.policy?.read?.enabled, true);
    assert.equal("authCookie" in browser.api.context, false);

    for ( const operations of Object.values(browser.contract.features) ) {

        for ( const wire of Object.values(operations) ) {

            if ( wire.enabled ) assert.notEqual(wire.execution, "server");

        }

    }

});
test("unknown features, operations and keys are rejected by path", () => {

    const attempt = ( overrides: unknown ) => () => coreApi(overrides as ContractOverrides);

    assert.throws(attempt({ features: { nope: {} } }), /contract\.features: unknown nope\./);
    assert.throws(attempt({ features: { products: { operations: { nope: {} } } } }), /contract\.features\.products\.operations: unknown nope\./);
    assert.throws(attempt({ features: { products: { operations: { list: { request: { fields: { bogus: "x" } } } } } } }), /products\.list: unknown request\.fields\.bogus\./);
    assert.throws(attempt({ features: { products: { operations: { list: { connection: "ghost" } } } } }), /products\.list: missing connection "ghost"\./);
    assert.throws(attempt({ response: { empty: true } }), /empty/);

});
