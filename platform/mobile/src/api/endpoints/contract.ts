import { z } from "zod";
import { call } from "@/api/client";
import { decimal, dict, maybeObject } from "@/api/contracts";

const rule = z.object({
    type: z.string().nullable().optional(),
    required: z.union([ z.boolean(), z.string() ]).nullable().optional(),
    required_when: z.string().nullable().optional(),
    drives: z.string().nullable().optional(),
    multiplies: z.string().nullable().optional(),
});

const rules = maybeObject(z.record(z.string(), z.union([ rule, z.string() ])));

const shape = z.object({
    capabilities: dict(z.object({
        capabilities: z.array(z.string()),
        subtypes: z.array(z.string()),
    })),
    limits: z.object({
        availability_horizon_days: decimal,
        availability_ahead_days: decimal,
        upload_max_bytes: decimal,
    }).nullable().optional(),
    uploads: z.object({
        max_bytes: decimal,
        policies: maybeObject(z.record(z.string(), z.object({ max_bytes: decimal }))),
    }).nullable().optional(),
    password: z.object({
        min: decimal,
        max: decimal,
        lower: z.boolean().nullable().optional(),
        upper: z.boolean().nullable().optional(),
        digit: z.boolean().nullable().optional(),
        symbol: z.boolean().nullable().optional(),
    }).nullable().optional(),
    requirements: maybeObject(z.record(z.string(), rules)),
    channels: z.object({
        realtime: z.object({
            key: z.string().nullable().optional(),
            host: z.string().nullable().optional(),
            port: decimal,
            scheme: z.string().nullable().optional(),
        }).nullable().optional(),
    }).nullable().optional(),
});

export type RulesRow = z.infer<typeof rules>;

export type ContractRow = z.infer<typeof shape>;

export const contract = {

    read: (): Promise<ContractRow> => call({ path: "contract", schema: shape }),

};
