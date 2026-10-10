import { media } from "@/api/client";
import { cashOr, numeric } from "@/api/contracts";
import type { PerkRow, RewardRow, StandingRow, TierRow } from "@/api/endpoints/account";
import type { Money } from "@/model/catalog";

export type Perk = {
    key: string;
    kind: string;
    value: Money;
    rate: number;
    cap: Money;
};

export type Condition = {
    key: string;
    window: number;
    money: boolean;
    required: number;
    reached: number;
    remaining: number;
    met: boolean;
};

type Progress = {
    rank: number;
    conditions: readonly Condition[];
};

export type Level = {
    id: number;
    rank: number;
    name: string;
    image: string | null;
    perks: readonly Perk[];
    progress: Progress | null;
};

export type Tier = {
    id: number;
    rank: number;
    name: string;
    color: string;
    summary: string;
    perks: readonly Perk[];
    benefits: readonly string[];
};

export type Reward = {
    id: number;
    key: string;
    kind: string;
    occurrence: string;
    points: number;
    amount: Money;
    at: string | null;
};

export const reachOf = ( condition: Condition ): number =>
    condition.required > 0 ? Math.min(1, condition.reached / condition.required) : 1;

export const climbOf = ( progress: Progress | null ): number => {

    if ( !progress || progress.conditions.length === 0 ) return 1;

    return progress.conditions.reduce(( sum, condition ) => sum + reachOf(condition), 0 ) / progress.conditions.length;

};

export const valued = ( perk: Perk ): boolean => perk.rate > 0 || perk.value.amount > 0;

const perkOf = ( row: PerkRow ): Perk => ({
    key: row.key,
    kind: row.value_type ?? "",
    value: cashOr(row.value),
    rate: numeric(row.rate_ppm) / 10000,
    cap: cashOr(row.cap),
});

export const levelOf = ( level: StandingRow ): Level | null => {

    const current = level.current;
    const progress = level.progress
        ? {
            rank: level.progress.next_rank ?? 0,
            conditions: level.progress.conditions.map(( row ) => ({
                key: row.key,
                window: row.window ?? 0,
                money: Boolean(row.money),
                required: numeric(row.required),
                reached: numeric(row.reached),
                remaining: numeric(row.remaining),
                met: Boolean(row.met),
            })),
        }
        : null;

    if ( !current && !progress ) return null;

    return {
        id: current?.id ?? 0,
        rank: current?.rank ?? 0,
        name: current?.name ?? "",
        image: media(current?.image),
        perks: current ? level.perks.map(perkOf) : [],
        progress,
    };

};

export const tiersOf = ( rows: readonly TierRow[] ): readonly Tier[] =>
    rows
        .map(( row ): Tier => ({
            id: row.id,
            rank: row.rank ?? 0,
            name: row.name ?? "",
            color: row.color ?? "",
            summary: row.description ?? "",
            perks: ( row.perks ?? [] ).map(perkOf),
            benefits: ( row.benefits ?? [] ).flatMap(( entry ) => entry.label ? [ entry.label ] : [] ),
        }))
        .sort(( first, second ) => first.rank - second.rank );

export const rewardOf = ( row: RewardRow ): Reward => ({
    id: row.id,
    key: row.reward?.key ?? "",
    kind: row.snapshot?.type ?? row.reward?.type ?? "",
    occurrence: row.occurrence ?? "",
    points: numeric(row.snapshot?.points),
    amount: cashOr(row.snapshot?.amount),
    at: row.created_at ?? null,
});
