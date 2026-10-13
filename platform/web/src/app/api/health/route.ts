import { read } from "@/api/workflow/server";
import { config, identity } from "@/lib/spec/server";

type Backend = { reachable: boolean; ms: number };

export const dynamic = "force-dynamic";

async function probe (): Promise<Backend> {
    const started = performance.now();

    try {
        const result = await read("site", "read");

        return { reachable: result.meta.source === "remote", ms: Math.round(performance.now() - started) };
    }
    catch {
        return { reachable: false, ms: Math.round(performance.now() - started) };
    }
}
export async function GET ( request: Request ): Promise<Response> {
    const deep = new URL(request.url).searchParams.has("deep") && config.api !== null;
    const backend = deep ? await probe() : undefined;
    const degraded = backend?.reachable === false;

    return Response.json(
        { status: degraded ? "degraded" : "ok", spec: identity, ...(backend ? { backend } : {}) },
        { status: degraded ? 503 : 200, headers: { "cache-control": "no-store" } },
    );
}
