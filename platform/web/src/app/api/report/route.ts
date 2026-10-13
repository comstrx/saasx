import { z } from "@engine/validate";
import { logger } from "@/lib/observe/server";
import { guardRequest } from "@/lib/site/guard";

export const dynamic = "force-dynamic";

const report = z.object({
    call: z.string().max(100),
    ms: z.number().nonnegative().max(600_000),
    trace: z.string().max(100).optional(),
    request: z.string().max(100).optional(),
    kind: z.string().max(40).optional(),
    status: z.number().int().optional(),
    reason: z.string().max(100).optional(),
    page: z.string().max(500).optional(),
});
const count = z.number().int().nonnegative().max(1_000_000);
const metrics = z.object({
    trace: z.string().max(100).optional(),
    page: z.string().max(500).optional(),
    metrics: z.array(z.object({ call: z.string().max(100), count, failures: count, ms: z.number().nonnegative().max(1e9), max: z.number().nonnegative().max(600_000) })).max(200),
});
const body = z.union([metrics, report]);

export async function POST ( request: Request ): Promise<Response> {

    const refused = guardRequest(request);

    if ( refused ) return refused;

    const parsed = body.safeParse(await request.json().catch(() => null));

    if ( !parsed.success ) return Response.json({ status: false }, { status: 400 });

    const served = request.headers.get("x-request-id") ?? undefined;

    if ( "metrics" in parsed.data ) logger.info("browser.metrics", { ...parsed.data, served });
    else logger.warn("browser.call", { ...parsed.data, served });

    return new Response(null, { status: 204 });

}
