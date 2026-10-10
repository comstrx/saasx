import { baseCurrency, cash, cashOr, numeric } from "@/api/contracts";
import type { CouponCheckRow, CouponEventRow, CouponRow } from "@/api/endpoints/coupons";
import type { Money } from "@/model/catalog";
import { isolateLtr } from "@/std/bidi";
import { stampOf } from "@/std/number";

type CouponKind = "percent" | "amount";

export type Coupon = {
    id: number;
    code: string;
    name: string;
    note: string;
    terms: string;
    kind: CouponKind;
    value: Money;
    rate: number;
    cap: Money;
    minPrice: Money;
    points: number;
    minOrders: number;
    valid: boolean;
    mine: boolean;
    startsAt: string | null;
    expiresAt: string | null;
};

export const worth = ( coupon: Coupon, cash: ( value: number, currency: string ) => string ): string =>
    coupon.kind === "percent" ? isolateLtr(`${ Math.round(coupon.rate) }%`) : cash(coupon.value.amount, coupon.value.currency);

export const usable = ( coupon: Coupon, now: number ): boolean => {

    if ( !coupon.valid ) return false;
    if ( !coupon.expiresAt ) return true;

    const ends = stampOf(coupon.expiresAt)?.getTime();

    return ends === undefined || ends > now;

};

export const urgency = ( coupon: Coupon ): number =>
    stampOf(coupon.expiresAt)?.getTime() ?? Number.MAX_SAFE_INTEGER;

export const soonest = ( coupons: readonly Coupon[] ): Coupon | null =>
    coupons.reduce<Coupon | null>(( best, coupon ) => !best || urgency(coupon) < urgency(best) ? coupon : best, null);

export const welcomeGift = ( available: readonly Coupon[], held: readonly Coupon[], now: number ): Coupon | null => {

    const owned = new Set(held.map(( coupon ) => coupon.code ));

    return soonest(available.filter(( coupon ) =>
        !owned.has(coupon.code) && coupon.points === 0 && coupon.minOrders === 0 && usable(coupon, now)
    ));

};

type CouponEvent = {
    id: number;
    code: string;
    status: string;
    discount: Money | null;
    orderId: number | null;
    at: string | null;
};

type CouponCheck = {
    id: number;
    code: string;
    discount: Money;
    basePrice: Money;
    totalPrice: Money;
};

const kindOf = ( value: string | null | undefined ): CouponKind => value === "amount" || value === "fixed" ? "amount" : "percent";

export const couponOf = ( entry: CouponRow, mine: boolean ): Coupon => {

    const held = entry.currency ?? baseCurrency;

    return {
        id: entry.id,
        code: entry.code ?? "",
        name: entry.name ?? "",
        note: entry.description ?? "",
        terms: entry.conditions ?? "",
        kind: kindOf(entry.value_type),
        value: cashOr(entry.value, held),
        rate: numeric(entry.rate),
        cap: cashOr(entry.cap, held),
        minPrice: cashOr(entry.min_price, held),
        points: numeric(entry.points),
        minOrders: entry.min_orders ?? 0,
        valid: entry.is_valid !== false,
        mine,
        startsAt: entry.starts_at ?? null,
        expiresAt: entry.expires_at ?? null,
    };

};

export const couponEventOf = ( row: CouponEventRow ): CouponEvent => ({
    id: row.coupon_id ?? 0,
    code: row.code ?? "",
    status: row.status ?? "",
    discount: cash(row.discount),
    orderId: row.order_id ?? null,
    at: row.at ?? null,
});

export const couponCheckOf = ( data: CouponCheckRow, code: string ): CouponCheck => ({
    id: data.coupon_id ?? 0,
    code: data.coupon_code ?? code,
    discount: cashOr(data.discount),
    basePrice: cashOr(data.base_price),
    totalPrice: cashOr(data.total_price),
});
