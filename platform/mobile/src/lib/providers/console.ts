import { lineSink, type Sink } from "@engine/log";

// biome-ignore lint/suspicious/noConsole: the one place the app hands log lines to the host console
export const sink: Sink = lineSink(( line ) => { console.warn(line); });
