import { describe, expect, test } from "bun:test";
import { createConnection, liveSource, pusherRealtime, pusherUrl } from "engine/socket";

type Served = { send: ( frame: unknown ) => void; drop: () => void; received: string[] };

function fake (): { open: Parameters<typeof createConnection>[0]["open"]; server: () => Served; drops: number } {

    const state = { drops: 0 };
    let current: Served | undefined;
    const open: Parameters<typeof createConnection>[0]["open"] = ( _url, handlers ) => {

        const received: string[] = [];

        current = {
            received,
            send: ( frame ) => handlers.message(JSON.stringify(frame)),
            drop: () => {

                state.drops += 1;
                handlers.close(1006, "dropped");

            },
        };
        setTimeout(() => handlers.open(), 1);

        return { send: ( data ) => received.push(data), close: () => handlers.close(1000, "bye") };

    };

    return { open, server: () => current as Served, drops: state.drops };

}
describe("connection", () => {

    test("opens, reconnects after a drop with backoff, and stops on close", async () => {

        const net = fake();
        const statuses: string[] = [];
        const connection = createConnection({ url: "ws://fake", open: net.open, backoffMs: 5, retries: 3 });

        connection.onStatus(( status ) => statuses.push(status));
        await connection.connect();
        expect(connection.status).toBe("open");
        net.server().drop();
        await new Promise(( resolve ) => setTimeout(resolve, 40));
        expect(connection.status).toBe("open");
        connection.close();
        expect(statuses).toEqual(["connecting", "open", "connecting", "open", "closed"]);

    });
    test("gives up after the retry budget and sending while closed is a failure", async () => {

        const open: Parameters<typeof createConnection>[0]["open"] = ( _url, handlers ) => {

            setTimeout(() => handlers.close(1006, "refused"), 1);

            return { send: () => undefined, close: () => undefined };

        };
        const connection = createConnection({ url: "ws://down", open, backoffMs: 1, retries: 2 });

        await expect(connection.connect()).rejects.toMatchObject({ kind: "network", reason: "socket_unreachable" });
        expect(() => connection.send("x")).toThrow();

    });

});
describe("pusher wire", () => {

    test("handshake yields the socket id, subscriptions are sent once and events reach their channel", async () => {

        const net = fake();
        const connection = createConnection({ url: "ws://fake", open: net.open });
        const realtime = pusherRealtime(connection, async ( channel, socketId ) => ({
            auth: `key:${socketId}:${channel}`,
        }));
        const seen: unknown[] = [];
        const ready = realtime.connect();

        await new Promise(( resolve ) => setTimeout(resolve, 5));
        net.server().send({
            event: "pusher:connection_established",
            data: JSON.stringify({ socket_id: "1.2", activity_timeout: 30 }),
        });
        expect(await ready).toBe("1.2");

        const off = realtime.subscribe("private-orders", ( data, event ) => seen.push([event, data]));

        realtime.subscribe("private-orders", () => undefined);
        await new Promise(( resolve ) => setTimeout(resolve, 5));
        expect(net.server().received.filter(( frame ) => frame.includes("pusher:subscribe"))).toHaveLength(1);
        expect(net.server().received[0]).toContain("key:1.2:private-orders");
        net.server().send({ event: "order.paid", channel: "private-orders", data: JSON.stringify({ id: 7 }) });
        net.server().send({ event: "pusher:ping", data: {} });
        expect(seen).toEqual([["order.paid", { id: 7 }]]);
        expect(net.server().received.some(( frame ) => frame.includes("pusher:pong"))).toBe(true);
        off();
        realtime.close();

    });

});
describe("live source", () => {

    test("connects once on the first subscription, filters events and leaves the channel with the last subscriber", async () => {

        const net = fake();
        const connection = createConnection({ url: "ws://fake", open: net.open });
        const realtime = pusherRealtime(connection);
        const live = liveSource(realtime);
        const seen: string[] = [];
        const offAll = live.subscribe("catalog.1", [], ( event ) => seen.push(`all:${event}`));
        const offSome = live.subscribe("catalog.1", ["catalog.event"], ( event ) => seen.push(`some:${event}`));

        await new Promise(( resolve ) => setTimeout(resolve, 5));
        net.server().send({ event: "pusher:connection_established", data: JSON.stringify({ socket_id: "9.9" }) });
        await new Promise(( resolve ) => setTimeout(resolve, 5));
        expect(net.server().received.filter(( frame ) => frame.includes("pusher:subscribe"))).toHaveLength(1);
        net.server().send({ event: "catalog.event", channel: "catalog.1", data: "{}" });
        net.server().send({ event: "other.event", channel: "catalog.1", data: "{}" });
        expect(seen).toEqual(["all:catalog.event", "some:catalog.event", "all:other.event"]);
        offAll();
        expect(net.server().received.some(( frame ) => frame.includes("pusher:unsubscribe"))).toBe(false);
        offSome();
        expect(net.server().received.some(( frame ) => frame.includes("pusher:unsubscribe"))).toBe(true);
        realtime.close();

    });
    test("the pusher address carries the key and protocol", () => {

        expect(pusherUrl("ws://127.0.0.1:8080/", "abc key")).toBe(
            "ws://127.0.0.1:8080/app/abc%20key?protocol=7&client=engine&version=1&flash=false",
        );

    });

});
describe("observation", () => {

    test("the address carries the trace and the connection reports open and dropped under it", async () => {

        const net = fake();
        const seen: { call: string; trace?: string | undefined; kind?: string | undefined }[] = [];
        const connection = createConnection({
            url: pusherUrl("ws://r.test", "k", "engine", "t-1"),
            open: net.open,
            backoffMs: 1,
            retries: 1,
            trace: "t-1",
            observe: ( outcome ) => seen.push({ call: outcome.call, trace: outcome.trace, kind: outcome.error?.kind }),
        });

        expect(pusherUrl("ws://r.test", "k", "engine", "t-1")).toContain("&trace=t-1");
        await connection.connect();
        net.server().drop();
        await new Promise(( resolve ) => setTimeout(resolve, 20));
        connection.close();
        expect(seen.map(( entry ) => entry.call)).toEqual(["socket.open", "socket.dropped", "socket.open"]);
        expect(seen.every(( entry ) => entry.trace === "t-1")).toBe(true);
        expect(seen[1]?.kind).toBe("network");

    });

});
describe("protocol edges", () => {

    test("a ping is answered with a pong, a refusal becomes a network failure, and channels re-join after a drop", async () => {

        const net = fake();
        const connection = createConnection({ url: "ws://fake", open: net.open, backoffMs: 1, retries: 3 });
        const realtime = pusherRealtime(connection);
        const ready = realtime.connect();

        await new Promise(( resolve ) => setTimeout(resolve, 5));
        net.server().send({ event: "pusher:connection_established", data: JSON.stringify({ socket_id: "9.9" }) });
        await ready;
        realtime.subscribe("orders", () => undefined);
        await new Promise(( resolve ) => setTimeout(resolve, 2));
        expect(net.server().received.some(( frame ) => frame.includes("pusher:subscribe"))).toBe(true);

        net.server().send({ event: "pusher:ping", data: {} });
        expect(net.server().received.some(( frame ) => frame.includes("pusher:pong"))).toBe(true);

        net.server().drop();
        await new Promise(( resolve ) => setTimeout(resolve, 30));
        net.server().send({ event: "pusher:connection_established", data: JSON.stringify({ socket_id: "9.10" }) });
        await new Promise(( resolve ) => setTimeout(resolve, 2));
        expect(net.server().received.filter(( frame ) => frame.includes("pusher:subscribe"))).toHaveLength(1);
        expect(realtime.socketId()).toBe("9.10");
        connection.close();

    });
    test("a malformed frame is ignored and a parsed data string reaches the handler as an object", async () => {

        const net = fake();
        const connection = createConnection({ url: "ws://fake", open: net.open });
        const realtime = pusherRealtime(connection);
        const seen: unknown[] = [];
        const ready = realtime.connect();

        await new Promise(( resolve ) => setTimeout(resolve, 5));
        net.server().send({ event: "pusher:connection_established", data: JSON.stringify({ socket_id: "1.1" }) });
        await ready;
        realtime.subscribe("orders", ( data ) => seen.push(data));
        net.server().send("not json");
        net.server().send({ event: "order.saved", channel: "orders", data: JSON.stringify({ id: 7 }) });
        net.server().send({ event: "order.saved", channel: "other", data: { id: 8 } });
        expect(seen).toEqual([{ id: 7 }]);
        connection.close();

    });

});
