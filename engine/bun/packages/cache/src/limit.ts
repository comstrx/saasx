export type Limit = { limit: number; windowMs: number };
export type Taken = { allowed: boolean; remaining: number; retryAfterMs?: number | undefined };

type Bucket = { count: number; resetAt: number };

export function rateLimiter (
    { limit, windowMs }: Limit,
    clock: () => number = Date.now,
): { take: ( key: string ) => Taken } {

    const buckets = new Map<string, Bucket>();
    let sweep = 0;

    return {
        take: ( key ) => {

            const now = clock();

            if ( now >= sweep ) {

                for ( const [name, bucket] of buckets ) if ( bucket.resetAt <= now ) buckets.delete(name);

                sweep = now + windowMs;

            }

            const bucket = buckets.get(key);
            const current = bucket && bucket.resetAt > now ? bucket : { count: 0, resetAt: now + windowMs };

            if ( current.count >= limit ) return { allowed: false, remaining: 0, retryAfterMs: current.resetAt - now };

            current.count += 1;
            buckets.set(key, current);

            return { allowed: true, remaining: limit - current.count };

        },
    };

}
