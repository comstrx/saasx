import { describe, expect, test } from "bun:test";
import { dedupe, expiring, lru, rateLimiter, remember } from "@engine/cache";

describe("cache", () => {

    test("expiring forgets after its lifetime", async () => {

        const cache = expiring<number>(5);

        cache.set("a", 1);
        expect(cache.get("a")).toBe(1);
        await new Promise(( resolve ) => setTimeout(resolve, 10));
        expect(cache.get("a")).toBeUndefined();

    });
    test("lru evicts the least recently used entry", () => {

        const cache = lru<string, number>(2);

        cache.set("a", 1);
        cache.set("b", 2);
        cache.get("a");
        cache.set("c", 3);
        expect(cache.has("b")).toBe(false);
        expect(cache.has("a")).toBe(true);

    });
    test("dedupe shares one in-flight load and remember keeps settled answers", async () => {

        let loads = 0;
        const shared = dedupe<number>();
        const load = async () => {

            loads += 1;

            return loads;

        };

        await Promise.all([shared("k", load), shared("k", load)]);
        expect(loads).toBe(1);

        const kept = remember<number>(50);

        expect(await kept("k", async () => 7)).toBe(7);
        expect(await kept("k", async () => 8)).toBe(7);

    });

});
describe("rate limiter", () => {

    test("allows a burst, refuses past the limit with a retry delay, and forgets after the window", () => {

        let clock = 1000;
        const limiter = rateLimiter({ limit: 2, windowMs: 1000 }, () => clock);

        expect(limiter.take("a")).toEqual({ allowed: true, remaining: 1 });
        expect(limiter.take("a")).toEqual({ allowed: true, remaining: 0 });
        expect(limiter.take("a")).toEqual({ allowed: false, remaining: 0, retryAfterMs: 1000 });
        expect(limiter.take("b")).toEqual({ allowed: true, remaining: 1 });
        clock = 2001;
        expect(limiter.take("a")).toEqual({ allowed: true, remaining: 1 });

    });

});
