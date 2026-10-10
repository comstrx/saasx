import { z } from "zod";
import { call, page } from "@/api/client";
import { decimal, money } from "@/api/contracts";

const person = z.object({
    id: z.number(),
    name: z.string().nullable().optional(),
    image: z.string().nullable().optional(),
}).nullable().optional();

const bond = z.object({
    id: z.number(),
    active: z.boolean().nullable().optional(),
    created_at: z.string().nullable().optional(),
    referred: person,
});

const bonds = z.array(bond);

const grant = z.object({
    id: z.number(),
    key: z.string().nullable().optional(),
    type: z.string().nullable().optional(),
    value: money,
    rate: decimal,
    cap: money,
    points: decimal,
    cadence: z.string().nullable().optional(),
    starts_at: z.string().nullable().optional(),
    expires_at: z.string().nullable().optional(),
    coupon: z.object({
        code: z.string().nullable().optional(),
        value: money,
        rate: decimal,
        cap: money,
    }).nullable().optional(),
});

const grants = z.array(grant);

export type BondRow = z.infer<typeof bond>;

export type GrantRow = z.infer<typeof grant>;

export const referrals = {

    list: ( at = 1, limit = 20 ) => page({ path: `referrals?limit=${ limit }`, schema: bonds }, at),

    programme: (): Promise<readonly GrantRow[]> => call({ path: "rewards?limit=50", schema: grants }),

};
