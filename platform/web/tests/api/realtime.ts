import assert from "node:assert/strict";
import { test } from "node:test";
import { channelDefaults, realtimeShape } from "../../src/api/core/config.ts";

test("the realtime config is the transport and its channels; the socket itself comes from the backend", () => {

    assert.deepEqual(realtimeShape.parse({ transport: "pusher" }), { transport: "pusher", channels: channelDefaults });

});
test("the realtime config refuses foreign transports, addresses and channel placeholders", () => {

    const rejects = ( value: unknown ) => assert.throws(() => realtimeShape.parse(value));

    rejects({ transport: "websocket" });
    rejects({ transport: "pusher", baseUrl: "wss://push.example.test" });
    rejects({ transport: "pusher", key: "k" });
    rejects({ transport: "pusher", channels: { order: { channel: "private-order.{tenantId}", event: "order.event" } } });
    rejects({ transport: "pusher", channels: { order: { channel: "order.{entityId}", event: "order.event" } } });
    rejects({ transport: "pusher", channels: { unknown: { channel: "private-x.{userId}", event: "x.event" } } });

});
