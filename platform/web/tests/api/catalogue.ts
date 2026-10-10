import assert from "node:assert/strict";
import { test } from "node:test";
import { channelsShape } from "../../src/api/core/config.ts";
import { ack, selection } from "../../src/api/core/fields.ts";
import { invalidate, onMutation } from "../../src/api/core/invalidation.ts";
import { parseResource, resourceDefaults, resourceKeys } from "../../src/api/core/resource.ts";
import { headerDefaults, headerKeys, requiredHeaders } from "../../src/api/core/wire.ts";
import { endpoints, entities, entityKinds, permissions, touches } from "../../src/api/features/index.ts";
import { sitemapKinds } from "../../src/api/features/sitemap.ts";
import { attempt, coreApi, harness } from "../core/backend.ts";

const identifier = /^[a-z][a-zA-Z0-9]*$/;

test("the catalogue is well-formed and names exactly the connections every spec must provide", () => {

    const { contract } = coreApi();
    const connections = new Set<string>();

    for ( const [feature, operations] of Object.entries(endpoints) ) {

        const routes = new Set<string>();

        assert.match(feature, identifier);

        for ( const [name, endpoint] of Object.entries(operations) ) {

            const route = `${endpoint.method} ${endpoint.path}`;
            const wire = contract.features[feature]?.[name];

            assert.match(name, identifier);
            assert.equal(routes.has(route), false, `${feature}: duplicate route ${route}`);
            assert.ok(wire, `${feature}.${name} has no wire`);
            routes.add(route);

            if ( !wire.enabled ) {

                assert.equal(endpoint.local !== undefined && endpoint.path === "/", true, `${feature}.${name} is disabled without being a local document`);
                continue;

            }

            connections.add(wire.connection);

            assert.equal(!!wire.response.pagination && !!wire.response.aggregates, endpoint.many, `${feature}.${name} pages only as a list`);

            if ( endpoint.output === ack ) assert.equal(wire.response.empty, true, `${feature}.${name} acknowledges without accepting empty data`);

        }

    }

    assert.deepEqual([...connections].sort(), ["broadcast", "primary"]);

});
test("resource defaults are strict, complete and idempotent", () => {

    for ( const key of resourceKeys ) {

        const defaults = resourceDefaults(key);

        assert.deepEqual(parseResource(key, defaults), defaults);
        assert.throws(() => parseResource(key, { ...defaults, unexpected: 1 }));

    }

});
test("header mapping is complete, unique and injection-proof", () => {

    const names = Object.values(headerDefaults ?? {}).map(( header ) => (typeof header === "string" ? header : header?.name ?? "").toLowerCase());

    assert.ok(requiredHeaders.every(( key ) => headerKeys.includes(key)));
    assert.equal(new Set(names).size, names.length);
    assert.throws(() => coreApi({ request: { headers: { tenant: "Host" } } }));
    assert.throws(() => coreApi({ request: { headers: { tenant: "Set-Cookie" } } }));
    assert.throws(() => coreApi({ request: { headers: { auth: { name: "Authorization", prefix: "Bearer\r\n" } } } }));
    assert.throws(() => coreApi({ request: { headers: { tenant: "X Tenant" } } }));

    const silent = coreApi({ request: { headers: { tenant: null } } }).contract.features.products?.list;

    assert.ok(silent?.enabled);
    assert.equal(Object.hasOwn(silent.request.headers, "tenant"), false);

});
test("realtime channel templates accept only the user and entity placeholders", () => {

    assert.equal(channelsShape.safeParse({ chat: { channel: "presence-chat.{userId}", event: "chat.event" } }).success, true);
    assert.equal(channelsShape.safeParse({ chat: { channel: "presence-chat.{roomId}", event: "chat.event" } }).success, false);
    assert.equal(channelsShape.safeParse({ chat: { channel: "chat.{userId}", event: "chat.event" } }).success, false);
    assert.equal(channelsShape.safeParse({ chat: { channel: "private-chat.{userId}", event: "chat event" } }).success, false);

});
test("bulk selections name exactly one target", () => {

    assert.deepEqual([{ ids: [1, 2] }, { all: true }, {}, { ids: [1], all: true }, { ids: [] }].map(( value ) => selection.safeParse(value).success), [
        true, true, false, false, false,
    ]);

});
test("every entity names a sitemap feed of its own and the parameter its view reads", async () => {

    const { client, calls } = harness("server");
    const feeds = entityKinds.map(( kind ) => entities[kind].feed);

    assert.deepEqual([...feeds].sort(), [...sitemapKinds].sort());

    for ( const kind of entityKinds ) {

        calls.length = 0;
        await attempt(entities[kind].view(client, 7));
        assert.match(calls[0]?.path ?? "", /^\/[a-z]+\/7$/, kind);
        assert.match(entities[kind].parameter, /^[a-z]+Id$/, kind);

    }

});
test("a write reloads its own feature and every feature its rows touch, each named once and never itself", () => {

    for ( const [writer, touched] of Object.entries(touches) ) {

        assert.equal(touched.includes(writer as keyof typeof endpoints), false, `${writer} touches itself`);
        assert.equal(new Set(touched).size, touched.length, `${writer} names a feature twice`);

        for ( const feature of touched ) {

            assert.ok(Object.hasOwn(endpoints, feature), `${writer} touches unknown ${feature}`);

        }

    }
    for ( const [feature, needed] of Object.entries(permissions) ) {

        for ( const permission of needed ) {

            assert.match(permission, /^[a-z][a-z0-9_.-]*$/, `${feature}: ${permission} is not a token`);

        }

    }

    assert.deepEqual(touches.cart, ["products", "orders", "wallet", "transactions", "notifications"]);
    assert.deepEqual(permissions.cart, ["user"]);
    assert.deepEqual(permissions.products, []);

    const seen: string[] = [];
    const stop = ["cart", "products", "wallet"].map(( feature ) => onMutation(feature as "cart", () => seen.push(feature)));

    invalidate("cart");
    invalidate("auth");

    for ( const close of stop ) {

        close();

    }

    assert.deepEqual(seen.sort(), ["cart", "products", "wallet"]);

});
