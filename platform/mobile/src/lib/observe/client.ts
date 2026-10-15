import { createObserver } from "engine/api";
import { uuid } from "engine/base";
import { createLogger, type Logger } from "engine/log";
import { sink } from "@/lib/providers/console";
import { onBackground } from "@/lib/providers/lifecycle";

export const logger: Logger = createLogger({ sinks: [sink] });

export const { trace, observeCall, flushMetrics, reportError } = createObserver({
    trace: uuid(),
    slow: 3000,
    watch: onBackground,
    send: ( signal ) => {

        if ( signal.kind === "report" ) return logger[signal.report.level](signal.report.event, signal.report.facts);
        if ( signal.kind === "metrics" ) return logger.info("api.metrics", { trace: signal.trace, metrics: signal.metrics });

        logger.error("render.failed", { name: signal.name, reason: signal.reason, trace: signal.trace });

    },
});

let ready = false;

export function markReady (): void {

    if ( ready ) return;

    ready = true;
    logger.info("app.ready", { trace, at: Date.now() });

}
