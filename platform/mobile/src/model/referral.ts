import { media } from "@/api/client";
import { cashOr, type MoneyShape, numeric } from "@/api/contracts";
import type { BondRow, GrantRow } from "@/api/endpoints/referrals";
import type { Money } from "@/model/catalog";

type Invited = {
    id: number;
    userId: number;
    name: string;
    image: string | null;
    active: boolean;
    at: string | null;
};

export type Grant = {
    id: number;
    key: string;
    kind: string;
    points: number;
    amount: Money;
    rate: number;
    cap: Money;
    cadence: string;
    couponCode: string;
    startsAt: string | null;
    expiresAt: string | null;
};

export const granted = ( grant: Grant ): boolean =>
    grant.points > 0 || grant.amount.amount > 0 || grant.rate > 0 || grant.couponCode.length > 0;

export const referralGrants = ( grants: readonly Grant[] ): readonly Grant[] =>
    grants.filter(( grant ) => grant.key.includes("referr") );

const pick = ( first: MoneyShape, second: MoneyShape ): Money => {

    const held = cashOr(first);

    return held.amount > 0 ? held : cashOr(second);

};

export const invitedOf = ( row: BondRow ): Invited => ({
    id: row.id,
    userId: row.referred?.id ?? 0,
    name: row.referred?.name ?? "",
    image: media(row.referred?.image),
    active: row.active !== false,
    at: row.created_at ?? null,
});

export const grantOf = ( row: GrantRow ): Grant => ({
    id: row.id,
    key: row.key ?? "",
    kind: row.type ?? "",
    points: numeric(row.points),
    amount: pick(row.value, row.coupon?.value),
    rate: numeric(row.rate) || numeric(row.coupon?.rate),
    cap: pick(row.cap, row.coupon?.cap),
    cadence: row.cadence ?? "",
    couponCode: row.coupon?.code ?? "",
    startsAt: row.starts_at ?? null,
    expiresAt: row.expires_at ?? null,
});
