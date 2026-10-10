import { oneOf } from "@/api/contracts";
import type { ContractRow, RulesRow } from "@/api/endpoints/contract";
import type { RealtimeSettings } from "@/api/realtime";
import type { PasswordPolicy } from "@/std/password";

export type CatalogType = {
    key: string;
    capabilities: readonly string[];
    subtypes: readonly string[];
};

type FieldRule = {
    required: boolean;
    when: string | null;
    drives: string | null;
    multiplies: string | null;
};

export type Requirements = Readonly<Record<string, Readonly<Record<string, FieldRule>>>>;

export type Limits = {
    horizonDays: number;
    aheadDays: number;
    uploadMaxBytes: number;
    uploads: Readonly<Record<string, number>>;
};

export type Contract = {
    types: readonly CatalogType[];
    requirements: Requirements;
    limits: Limits;
    password: PasswordPolicy;
    realtime: RealtimeSettings | null;
};

export const passwordBase: PasswordPolicy = { min: 6, max: 255, lower: true, upper: true, digit: true, symbol: true };

export const uploadCap = ( limits: Limits | undefined, kind: string ): number =>
    limits ? limits.uploads[kind] ?? limits.uploadMaxBytes : 0;

const ruled = ( shaped: RulesRow ): Readonly<Record<string, FieldRule>> =>
    Object.fromEntries(Object.entries(oneOf(shaped) ?? {}).flatMap(([ name, spec ]) => {

        if ( typeof spec === "string" ) return [];

        const demand = spec.required;

        return [ [ name, {
            required: demand === true,
            when: typeof demand === "string" ? demand : spec.required_when ?? null,
            drives: spec.drives ?? null,
            multiplies: spec.multiplies ?? null,
        } ] ];

    }));

const bounded = ( value: string | number | null | undefined, fallback: number ): number => {

    const parsed = Number(value);

    return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : fallback;

};

export const contractOf = ( data: ContractRow ): Contract => {

    const transport = bounded(data.limits?.upload_max_bytes, 2 * 1024 * 1024);
    const realtime = data.channels?.realtime;
    const password = data.password;

    return {
        types: Object.entries(data.capabilities).map(([ key, entry ]) => ({
            key,
            capabilities: entry.capabilities,
            subtypes: entry.subtypes,
        })),
        requirements: Object.fromEntries(Object.entries(oneOf(data.requirements) ?? {}).map(([ capability, fields ]) => [ capability, ruled(fields) ] )),
        limits: {
            horizonDays: bounded(data.limits?.availability_horizon_days, 31),
            aheadDays: bounded(data.limits?.availability_ahead_days, 730),
            uploadMaxBytes: transport,
            uploads: Object.fromEntries(Object.entries(oneOf(data.uploads?.policies) ?? {}).map(([ kind, policy ]) => [ kind, Math.min(bounded(policy.max_bytes, transport), transport) ] )),
        },
        password: {
            min: bounded(password?.min, passwordBase.min),
            max: bounded(password?.max, passwordBase.max),
            lower: password?.lower ?? passwordBase.lower,
            upper: password?.upper ?? passwordBase.upper,
            digit: password?.digit ?? passwordBase.digit,
            symbol: password?.symbol ?? passwordBase.symbol,
        },
        realtime: realtime?.key && realtime.host
            ? {
                key: realtime.key,
                host: realtime.host,
                port: bounded(realtime.port, 443),
                scheme: realtime.scheme === "http" ? "http" : "https",
            }
            : null,
    };

};
