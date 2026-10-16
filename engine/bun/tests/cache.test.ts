import { describe, expect, test } from "bun:test";
import { dedupe, expiring, lru, rateLimiter, remember } from "engine/cache";

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
        expect(cache.keys()).toEqual(["a", "c"]);

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
describe("edges", () => {

    test("reading an lru entry makes it the newest, so the untouched one leaves first", () => {

        const cache = lru<string, number>(2);

        cache.set("a", 1);
        cache.set("b", 2);
        cache.get("a");
        cache.set("c", 3);
        expect(cache.has("b")).toBe(false);
        expect(cache.has("a")).toBe(true);
        expect(cache.size()).toBe(2);

    });
    test("an expiring entry may carry its own lifetime and the map sweeps itself past five hundred", async () => {

        const cache = expiring<number>(10_000);

        cache.set("short", 1, 5);
        cache.set("long", 2);
        await Bun.sleep(12);
        expect(cache.get("short")).toBeUndefined();
        expect(cache.get("long")).toBe(2);

        for ( let i = 0; i < 520; i += 1 ) cache.set(`k${i}`, i, i < 510 ? 1 : 10_000);

        await Bun.sleep(5);
        cache.set("trigger", 0);
        expect(cache.get("k3")).toBeUndefined();
        expect(cache.size()).toBeLessThan(520);

    });
    test("remember keeps a failure only when told to, and refuses to cache the rest", async () => {

        let calls = 0;
        const flaky = async () => {

            calls += 1;

            throw new Error("down");

        };
        const forgetful = remember<number>(10_000);
        const sticky = remember<number>(10_000, () => true);

        await expect(forgetful("k", flaky)).rejects.toThrow("down");
        await expect(forgetful("k", flaky)).rejects.toThrow("down");
        expect(calls).toBe(2);
        await expect(sticky("k", flaky)).rejects.toThrow("down");
        await expect(sticky("k", flaky)).rejects.toThrow("down");
        expect(calls).toBe(3);

    });
    test("rate limits are per key and reset exactly when the window closes", () => {

        let clock = 1000;
        const limiter = rateLimiter({ limit: 2, windowMs: 100 }, () => clock);

        expect(limiter.take("a").allowed).toBe(true);
        expect(limiter.take("b").allowed).toBe(true);
        expect(limiter.take("a").allowed).toBe(true);
        expect(limiter.take("a")).toEqual({ allowed: false, remaining: 0, retryAfterMs: 100 });
        clock = 1099;
        expect(limiter.take("a").allowed).toBe(false);
        clock = 1100;
        expect(limiter.take("a")).toEqual({ allowed: true, remaining: 1 });

    });

});
