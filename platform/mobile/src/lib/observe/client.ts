import { type Observer, reportOf } from "@engine/api";
import { createLogger, type Logger } from "@engine/log";
import { sink } from "@/lib/providers/console";

export const logger: Logger = createLogger({ sinks: [sink] });

export function reportError ( name: string, error: unknown ): void {

    logger.error("render.failed", { name, reason: error instanceof Error ? error.name : "unknown" });

}
export const observeCall: Observer = ( outcome ) => {

    const report = reportOf(outcome, 3000);

    if ( report ) logger[report.level](report.event, report.facts);

};
