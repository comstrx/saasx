import { describe, expect, test } from "bun:test";
import { Failure } from "@engine/error";
import {
    contentSecurityPolicy,
    forwardedFor,
    isOrigin,
    joinUrl,
    readJson,
    retryAfter,
    sameOrigin,
    send,
} from "@engine/net";

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
