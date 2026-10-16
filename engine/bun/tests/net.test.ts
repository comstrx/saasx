import { describe, expect, test } from "bun:test";
import { Failure } from "engine/error";
import {
    contentSecurityPolicy,
    forwardedFor,
    hostname,
    isEndpoint,
    isLoopback,
    isOrigin,
    joinUrl,
    originOf,
    readJson,
    retryAfter,
    sameOrigin,
    send,
} from "engine/net";

describe("net", () => {

    test("url and header helpers", () => {

        expect(isOrigin("https://a.test")).toBe(true);
        expect(isOrigin("https://a.test/x")).toBe(false);
        expect(joinUrl("https://a.test/v1/", "/items", { page: 2 }).toString()).toBe("https://a.test/v1/items?page=2");
        expect(forwardedFor("1.1.1.1, 2.2.2.2, 3.3.3.3", 2)).toBe("2.2.2.2");
        expect(contentSecurityPolicy({ "default-src": ["'self'", false], "img-src": ["'self'", "data:"] })).toBe(
            "default-src 'self'; img-src 'self' data:",
        );
        expect(retryAfter("3")).toBe(3);

    });
    test("send retries transient statuses with backoff and gives up on a long Retry-After", async () => {

        let calls = 0;
        const transport = async () => {

            calls += 1;

            return new Response("{}", { status: calls < 3 ? 503 : 200 });

        };
        const { response, attempts } = await send("https://a.test/x", { method: "GET" }, { retries: 3, transport });

        expect(response.status).toBe(200);
        expect(attempts).toBe(3);

        const slow = async () => new Response("", { status: 503, headers: { "retry-after": "30" } });

        await expect(
            send("https://a.test/x", { method: "GET" }, { retries: 2, transport: slow }),
        ).rejects.toBeInstanceOf(Failure);

    });
    test("bounded body reading refuses oversized and non-JSON answers", async () => {

        await expect(readJson(new Response("x".repeat(20)), 10)).rejects.toMatchObject({ reason: "too_large" });
        await expect(readJson(new Response("{bad"), 10)).rejects.toMatchObject({ reason: "not_json" });
        expect(await readJson(new Response(""), 10)).toBeUndefined();

    });

});
describe("same origin", () => {

    test("a request origin must match the host it reaches", () => {

        expect(sameOrigin("http://localhost:3001", "localhost:3001", false)).toBe(true);
        expect(sameOrigin("https://shop.test", "shop.test", true)).toBe(true);
        expect(sameOrigin("http://shop.test", "shop.test", true)).toBe(false);
        expect(sameOrigin("http://evil.test", "shop.test", false)).toBe(false);
        expect(sameOrigin(null, "shop.test", false)).toBe(false);
        expect(sameOrigin("null", "shop.test", false)).toBe(false);

    });

});
describe("edges", () => {

    test("forwarded-for counts hops from the right and gives up past the chain", () => {

        expect(forwardedFor("1.1.1.1, 2.2.2.2, 3.3.3.3", 1)).toBe("3.3.3.3");
        expect(forwardedFor("1.1.1.1, 2.2.2.2, 3.3.3.3", 2)).toBe("2.2.2.2");
        expect(forwardedFor("1.1.1.1", 3)).toBeUndefined();
        expect(forwardedFor("1.1.1.1", 0)).toBeUndefined();
        expect(forwardedFor(null, 1)).toBeUndefined();

    });
    test("retry-after reads seconds or a date and never goes negative", () => {

        expect(retryAfter("30")).toBe(30);
        expect(retryAfter("-1")).toBeUndefined();
        expect(retryAfter(new Date(Date.now() - 60_000).toUTCString())).toBe(0);
        expect(retryAfter("soon")).toBeUndefined();
        expect(retryAfter(null)).toBeUndefined();

    });
    test("a content security policy drops empty and false sources", () => {

        expect(
            contentSecurityPolicy({ "default-src": ["'self'"], "img-src": ["'self'", false, "", null, "https:"], "frame-ancestors": [] }),
        ).toBe("default-src 'self'; img-src 'self' https:; frame-ancestors");

    });
    test("origins and endpoints are strict about credentials, paths, queries and schemes", () => {

        expect(isOrigin("https://a.test")).toBe(true);
        expect(isOrigin("https://a.test/")).toBe(false);
        expect(isOrigin("https://u:p@a.test")).toBe(false);
        expect(isOrigin("ftp://a.test")).toBe(false);
        expect(isEndpoint("https://a.test/v1/")).toBe(true);
        expect(isEndpoint("https://a.test/v1?x=1")).toBe(false);
        expect(hostname("A.Test:8080")).toBe("a.test");
        expect(hostname("::bad::")).toBeUndefined();
        expect(originOf("a.test:3000", false)).toBe("http://a.test:3000");

    });
    test("joined urls keep one slash and spread query arrays; loopbacks are recognized in every spelling", () => {

        const url = joinUrl("https://a.test/", "/v1/items", { ids: [1, 2], q: "x y" });

        expect(url.toString()).toBe("https://a.test/v1/items?ids%5B%5D=1&ids%5B%5D=2&q=x+y");
        expect(isLoopback("http://localhost:3000")).toBe(true);
        expect(isLoopback("http://app.localhost")).toBe(true);
        expect(isLoopback("http://[::1]:80")).toBe(true);
        expect(isLoopback("http://10.0.0.1")).toBe(false);
        expect(sameOrigin("https://A.test", "a.test", true)).toBe(true);
        expect(sameOrigin("http://a.test", "a.test", true)).toBe(false);

    });

describe("bounded bodies", () => {

    test("a body streamed without a length is cut off as soon as it passes the limit, never read to the end", async () => {

        let pulled = 0;
        const endless = new ReadableStream<Uint8Array>({
            pull: ( controller ) => {

                pulled += 1;
                controller.enqueue(new Uint8Array(1024).fill(120));

            },
        });

        await expect(readJson(new Response(endless), 4096)).rejects.toMatchObject({ reason: "too_large" });
        expect(pulled).toBeLessThan(10);

    });
    test("a request body is read with the same limit, so a route handler can refuse a flood", async () => {

        const small = new Request("http://a.test/report", { method: "POST", body: JSON.stringify({ ok: true }) });
        const large = new Request("http://a.test/report", { method: "POST", body: "x".repeat(10_000) });

        expect(await readJson(small, 1024)).toEqual({ ok: true });
        await expect(readJson(large, 1024)).rejects.toMatchObject({ reason: "too_large" });

    });

});
});
