import { publicApi } from "@/api/workflow/server";
import { identity } from "@/lib/spec/config";

type Backend = { reachable: boolean; ms: number };

export const dynamic = "force-dynamic";

async function probe (): Promise<Backend> {

    const started = performance.now();

    try {

        await publicApi.policy.read();

        return { reachable: true, ms: Math.round(performance.now() - started) };

    }
    catch {

        return { reachable: false, ms: Math.round(performance.now() - started) };

    }

}
export async function GET ( request: Request ): Promise<Response> {

    const backend = new URL(request.url).searchParams.has("deep") ? await probe() : undefined;
    const degraded = backend?.reachable === false;

    return Response.json(
        { status: degraded ? "degraded" : "ok", spec: identity, ...(backend ? { backend } : {}) },
        { status: degraded ? 503 : 200, headers: { "cache-control": "no-store" } },
    );

}
