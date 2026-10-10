import "server-only";

import type { Instrumentation } from "next";
import { type Outcome, reportOf } from "@/api/core/error";
import { z } from "@/lib/providers/schema";
import { requestClient } from "@/lib/site/request";
import { budget } from "@/lib/std/cache";
import { readBody, status } from "@/lib/std/fetch";
import { parseJson } from "@/lib/std/json";
import { errorFacts, logLine } from "@/lib/std/log";

const slow = 1500;
const allowance = budget(60, 60000);
const fact = z.union([z.string().max(4000), z.number().finite(), z.boolean()]);

const signals = z.array(z.strictObject({
    level: z.enum(["error", "warn"]),
    event: z.string().regex(/^[a-z]+(?:\.[a-z]+)*$/).max(40),
    facts: z.record(z.string().regex(/^[a-zA-Z]{1,30}$/), fact).refine(( facts ) => Object.keys(facts).length <= 20),
})).min(1).max(20);

async function batch ( request: Request ): Promise<z.output<typeof signals> | undefined> {

    const text = await readBody(request.body, 16384);
    const found = text ? signals.safeParse(parseJson(text)) : undefined;

    return found?.success ? found.data : undefined;

}
export function observeCall ( outcome: Outcome ): void {

    const report = reportOf(outcome, slow);

    if ( report ) logLine(report.level, report.event, report.facts);

}
export const onRequestError: Instrumentation.onRequestError = ( error, request, context ) => {

    const trace = request.headers["x-request-id"];

    logLine("error", "request.failure", {
        ...errorFacts(error),
        trace: typeof trace === "string" ? trace : undefined,
        method: request.method,
        path: request.path.split("?")[0],
        route: context.routePath,
        type: context.routeType,
        source: context.renderSource,
    });

};
function own ( request: Request ): boolean {

    const site = request.headers.get("sec-fetch-site");

    return site ? site === "same-origin" : request.headers.get("origin") === new URL(request.url).origin;

}
export async function receiveSignals ( request: Request ): Promise<Response> {

    if ( !own(request) ) return status(403);

    const found = await batch(request);

    if ( !found ) return status(400);
    if ( !allowance((await requestClient()) ?? "unknown", found.length) ) return status(429);

    for ( const { level, event, facts } of found ) {

        logLine(level, `browser.${event}`, facts);

    }

    return status(204);

}
