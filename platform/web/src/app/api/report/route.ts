import { z } from "@engine/validate";
import { logger } from "@/lib/observe/server";
import { guardRequest } from "@/lib/site/guard";

export const dynamic = "force-dynamic";

const report = z.object({
    call: z.string().max(100),
    ms: z.number().nonnegative().max(600_000),
    request: z.string().max(100).optional(),
    kind: z.string().max(40).optional(),
    status: z.number().int().optional(),
    reason: z.string().max(100).optional(),
    page: z.string().max(500).optional(),
});

export async function POST ( request: Request ): Promise<Response> {

    const refused = guardRequest(request);

    if ( refused ) return refused;

    const parsed = report.safeParse(await request.json().catch(() => null));

    if ( !parsed.success ) return Response.json({ status: false }, { status: 400 });

    logger.warn("browser.call", { ...parsed.data, trace: request.headers.get("x-request-id") ?? undefined });

    return new Response(null, { status: 204 });

}
