import "server-only";

import { type Observer, reportOf } from "@engine/api";
import { createLogger, lineSink } from "@engine/log";

const slow = 1500;

export const logger = createLogger({ sinks: [lineSink(( line ) => { process.stdout.write(`${line}\n`); })] });

export const observeCall: Observer = ( outcome ) => {

    const report = reportOf(outcome, slow);

    if ( report ) logger[report.level](report.event, report.facts);

};
