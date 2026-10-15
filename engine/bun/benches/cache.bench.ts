import { expiring, lru, rateLimiter } from "engine/cache";
import { bench, do_not_optimize, run } from "engine/tooling";

const recent = lru<string, number>(1000);
const timed = expiring<number>(60_000);
const limiter = rateLimiter({ limit: 1_000_000, windowMs: 60_000 });

for ( let i = 0; i < 1000; i += 1 ) {

    recent.set(`k${i}`, i);
    timed.set(`k${i}`, i);

}

bench("lru.get (touch)", () => do_not_optimize(recent.get("k500")));
bench("expiring.get", () => do_not_optimize(timed.get("k500")));
bench("rateLimiter.take", () => do_not_optimize(limiter.take("ip")));

await run();
