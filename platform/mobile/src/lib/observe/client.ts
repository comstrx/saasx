import { createMeter, type Observer, reportOf } from "@engine/api";
import { uuid } from "@engine/base";
import { createLogger, type Logger } from "@engine/log";
import { sink } from "@/lib/providers/console";
import { onBackground } from "@/lib/providers/lifecycle";

const meter = createMeter();
let watching = false;

export const logger: Logger = createLogger({ sinks: [sink] });
/**
 * This launch's trace: one id every api call and the realtime socket carry.
 */
export const trace: string = uuid();

export function reportError ( name: string, error: unknown ): void {

    logger.error("render.failed", { name, reason: error instanceof Error ? error.name : "unknown", trace });

}
/**
 * The counters gathered since the last flush, logged in one line when the app leaves the foreground.
 */
export function flushMetrics (): void {

    const metrics = meter.flush();

    if ( metrics.length ) logger.info("api.metrics", { trace, metrics });

}
function watch (): void {

    if ( watching ) return;

    watching = true;
    onBackground(flushMetrics);

}
export const observeCall: Observer = ( outcome ) => {

    meter.record(outcome);
    watch();

    const report = reportOf(outcome, 3000);

    if ( report ) logger[report.level](report.event, report.facts);

};
