import { lineSink, type Sink } from "engine/log";

export const sink: Sink = lineSink(( line ) => { console.warn(line); });
