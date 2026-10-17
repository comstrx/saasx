import { beaconShape } from "engine/api";
import { readJson } from "engine/net";
import { logger } from "@/lib/observe/server";
import { guardRequest } from "@/lib/site/guard";

export const dynamic = "force-dynamic";

export async function POST ( request: Request ): Promise<Response> {

    const refused = guardRequest(request);

    if ( refused ) return refused;

    const parsed = beaconShape.safeParse(await readJson(request, 64 * 1024).catch(() => null));

    if ( !parsed.success ) return Response.json({ status: false }, { status: 400 });

    const served = request.headers.get("x-request-id") ?? undefined;

    if ( "metrics" in parsed.data ) logger.info("browser.metrics", { ...parsed.data, served });
    else logger.warn("browser.call", { ...parsed.data, served });

    return new Response(null, { status: 204 });

}
