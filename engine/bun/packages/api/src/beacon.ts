import { z } from "engine/validate";

const text = ( max: number ) => z.string().max(max);
const count = z.number().int().nonnegative().max(1_000_000);
const callShape = z.object({
    call: text(100),
    ms: z.number().nonnegative().max(600_000),
    trace: text(100).optional(),
    request: text(100).optional(),
    kind: text(40).optional(),
    status: z.number().int().optional(),
    reason: text(100).optional(),
    page: text(500).optional(),
});
const metricShape = z.object({
    call: text(100),
    count,
    failures: count,
    ms: z.number().nonnegative().max(1e9),
    max: z.number().nonnegative().max(600_000),
});
const metricsShape = z.object({
    trace: text(100).optional(),
    page: text(500).optional(),
    metrics: z.array(metricShape).max(200),
});

export const beaconShape = z.union([metricsShape, callShape]);

export type Beacon = z.output<typeof beaconShape>;
