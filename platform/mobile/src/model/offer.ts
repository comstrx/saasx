import { picture } from "@/api/client";
import { cash, oneOf } from "@/api/contracts";
import type { OfferRow } from "@/api/endpoints/offers";
import type { Money, Picture } from "@/model/catalog";
import { isolateLtr } from "@/std/bidi";

export type Offer = {
    id: number;
    title: string;
    body: string;
    badge: string | null;
    type: string;
    image: Picture | null;
    endsAt: string | null;
};

export const badgeOf = ( percent: number | null, amount: Money | null ): string | null => {

    if ( percent && percent > 0 ) return isolateLtr(`-${ Math.round(percent) }%`);
    if ( amount && amount.amount > 0 ) return isolateLtr(`-${ Math.round(amount.amount) } ${ amount.currency }`);

    return null;

};

const rateOf = ( value: OfferRow["rate"] ): number | null =>
    value === null || value === undefined ? null : Number(value);

export const offerOf = ( entry: OfferRow ): Offer => ({
    id: entry.id,
    title: entry.name ?? "",
    body: entry.description ?? "",
    badge: badgeOf(rateOf(entry.rate), cash(entry.value)),
    type: entry.type ?? "promotion",
    image: picture(entry.image, oneOf(entry.image_variants)),
    endsAt: entry.expires_at ?? null,
});
