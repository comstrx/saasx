import type { OrderBody } from "@/api/endpoints/orders";
import type { PayType, QuoteFace } from "@/model/order";
import { addIsoDays, type DateSpan, nightsBetween, todayIso } from "@/std/date-range";

export type CheckoutGuests = {
    adults: number;
    children: number;
    infants: number;
    pets: number;
};

export type CheckoutPaymentPlan = "full" | "deposit";
export type CheckoutPaymentSource = "gateway" | "wallet";
export type CheckoutPanel = "dates" | "guests" | "coupon" | null;

export type CheckoutSelection = {
    dates: DateSpan;
    guests: CheckoutGuests;
};

export type Applicant = {
    key: string;
    name: string;
    birth: string;
};

export const emptyApplicant = ( key: string ): Applicant => ({ key, name: "", birth: "" });

export const nextApplicantKey = ( applicants: readonly Applicant[] ): string =>
    `applicant-${ applicants.reduce(( top, person ) => Math.max(top, Number(person.key.split("-")[1]) || 0), 0) + 1 }`;

export const applicantReady = ( applicant: Applicant ): boolean =>
    applicant.name.trim().length > 1 && /^\d{4}-\d{2}-\d{2}$/.test(applicant.birth);

export const applicantsReady = ( applicants: readonly Applicant[] ): boolean =>
    applicants.length > 0 && applicants.every(applicantReady);

type BasketAddon = {
    id: number;
    quantity: number;
};

export type CheckoutBasket = {
    catalog: number;
    quantity: number;
    sellable?: number | undefined;
    coupon?: string | undefined;
    addons?: readonly BasketAddon[] | undefined;
    pay?: PayType | undefined;
    gateway?: number | undefined;
    startsAt: string;
    endsAt: string;
    adults: number;
    children: number;
    infants: number;
    pets: number;
    applicants?: readonly Applicant[] | undefined;
};

export type CheckoutSeed = {
    starts?: string | null | undefined;
    ends?: string | null | undefined;
    adults?: number | undefined;
    children?: number | undefined;
    applicants?: readonly Applicant[] | undefined;
};

const bounded = ( value: number | undefined, fallback: number, minimum: number ): number =>
    Math.max(minimum, Number.isFinite(value) ? Number(value) : fallback);

export const initialCheckoutSelection = ( seed: CheckoutSeed = {} ): CheckoutSelection => {

    const minimum = todayIso();
    const start = seed.starts && seed.starts >= minimum ? seed.starts : addIsoDays(minimum, 14);
    const end = seed.ends && seed.ends > start ? seed.ends : addIsoDays(start, 1);

    return {
        dates: { start, end },
        guests: {
            adults: bounded(seed.adults, 1, 1),
            children: bounded(seed.children, 0, 0),
            infants: 0,
            pets: 0,
        },
    };

};

export const checkoutNights = ( selection: CheckoutSelection ): number =>
    nightsBetween(selection.dates.start, selection.dates.end);

type CheckoutScope = {
    dated: boolean;
    ranged: boolean;
    seated: boolean;
};

export const checkoutBasket = (
    catalog: number,
    sellable: number | undefined,
    quantity: number,
    selection: CheckoutSelection,
    scope: CheckoutScope,
    coupon?: string | undefined,
    applicants?: readonly Applicant[] | undefined,
    addons?: readonly BasketAddon[] | undefined,
    rail?: { pay: PayType; gateway?: number | undefined } | undefined,
): CheckoutBasket => ({
    catalog,
    quantity: applicants?.length ? applicants.length : quantity,
    sellable,
    coupon,
    addons,
    pay: rail?.pay,
    gateway: rail?.gateway,
    startsAt: scope.dated ? selection.dates.start ?? "" : "",
    endsAt: scope.dated && scope.ranged ? selection.dates.end ?? "" : "",
    adults: scope.seated ? selection.guests.adults : 0,
    children: scope.seated ? selection.guests.children : 0,
    infants: scope.seated ? selection.guests.infants : 0,
    pets: scope.seated ? selection.guests.pets : 0,
    applicants,
});

export const orderBody = ( basket: CheckoutBasket ): OrderBody => ({
    catalog_id: basket.sellable ?? basket.catalog,
    quantity: basket.quantity,
    ...( basket.startsAt ? { starts_at: basket.startsAt } : {} ),
    ...( basket.endsAt ? { ends_at: basket.endsAt } : {} ),
    ...( basket.adults > 0 ? { adults: basket.adults } : {} ),
    ...( basket.children > 0 ? { children: basket.children } : {} ),
    ...( basket.infants > 0 ? { infants: basket.infants } : {} ),
    ...( basket.pets > 0 ? { pets: true } : {} ),
    ...( basket.coupon ? { coupon_code: basket.coupon } : {} ),
    ...( basket.pay ? { pay_type: basket.pay } : {} ),
    ...( basket.gateway ? { gateway_id: basket.gateway } : {} ),
    ...( basket.applicants?.length
        ? { applicants: basket.applicants.map(( person ) => ({ name: person.name.trim(), birth_date: person.birth }) ) }
        : {} ),
    ...( basket.addons?.length
        ? { addons: basket.addons.map(( extra ) => ({ catalog_id: extra.id, quantity: extra.quantity }) ) }
        : {} ),
});

export const checkoutPayment =( face: QuoteFace | null | undefined, plan: CheckoutPaymentPlan ): number => {

    if ( !face ) return 0;
    if ( plan === "deposit" && face.deposit > 0 ) return face.deposit;

    return face.total;

};

const guestCount = ( guests: CheckoutGuests ): number =>
    guests.adults + guests.children;

export const guestDraftValid = ( guests: CheckoutGuests, capacity: number ): boolean =>
    guests.adults >= 1 && ( capacity <= 0 || guestCount(guests) <= capacity );

const datesValid = ( span: DateSpan ): boolean =>
    Boolean(span.start && span.end && nightsBetween(span.start, span.end) > 0);

export const datesSettled = ( span: DateSpan, ranged: boolean ): boolean =>
    ranged ? datesValid(span) : Boolean(span.start);
