import { z } from "../../lib/providers/schema.ts";
import { engage, feature, get, many, post, put, trash } from "../core/dsl.ts";
import {
    amount, confirmCode, count, currency, decimal, flag, httpUrl, id, list, maybeObject, money,
    person, text,
} from "../core/fields.ts";
import { attachment } from "./documents.ts";
import { review, reviewInput } from "./reviews.ts";

const quantity = z.number().int().min(1).max(1000);
const guests = z.number().int().min(0).max(100);
const date = z.string().regex(/^\d{4}-\d{2}-\d{2}(?:[T ]\d{2}:\d{2}(?::\d{2})?(?:Z|[+-]\d{2}:\d{2})?)?$/);
const quoteToken = z.string().min(1).max(20000);
const claim = z.object({ id: z.number().nullish(), asked: decimal, applied: decimal }).nullish();
const discounts = z.object({
    base: decimal,
    level: claim,
    offer: claim,
    coupon: claim,
    cap_amount: decimal,
    cap_percent: decimal,
}).nullish();
const answer = z.union([z.string().max(5000), z.number(), z.boolean()]);
const answerRow = z.union([answer, z.array(answer.nullable()).max(100)]).nullable();
const answerLine = z.object({ key: z.string(), scope: z.string(), index: z.number().int().min(0), value: answerRow });
const charges = z.array(z.record(z.string(), z.unknown())).nullish();
const priced = z.object({
    currency: text,
    price_id: z.number().nullish(),
    price_version: count,
    quantity: count,
    nights: count,
    unit_price: decimal,
    base_price: decimal,
    net_price: decimal,
    total_price: decimal,
    min_first_payment: decimal,
    deposit_percent: decimal,
    deposit_hold: decimal,
    exchange_rate: decimal,
    discount: decimal,
    offer_id: z.number().nullish(),
    offer_discount: decimal,
    coupon_id: z.number().nullish(),
    coupon_code: text,
    level_discount: decimal,
    workspace_discount: decimal,
    discounts,
    bands: charges,
    fees: charges,
    fees_due_now: decimal,
    fees_on_site: decimal,
    fees_kept: decimal,
    tax_percent: decimal,
    tax_amount: decimal,
    composition: z.record(z.string(), z.boolean()).nullish(),
    eligibility: z.object({ verdict: text, rule: text, subject: text }).nullish(),
    answers: z.array(answerLine).nullish(),
    breakdown: z.array(z.object({ key: z.string(), amount: decimal, tone: text })).nullish(),
    payment_options: z.array(z.object({
        kind: z.string(),
        allowed: flag,
        currency: text,
        due_now: decimal,
        due_later: decimal,
        due_at: text,
    })).nullish(),
    applicants: z.array(z.object({ premium: decimal })).nullish(),
    lines: z.array(z.object({
        catalog_id: z.number().nullish(),
        name: text,
        quantity: count,
        total_price: decimal,
        currency: text,
        fees_on_site: decimal,
    })).nullish(),
    family_total: decimal,
    family_hold: decimal,
});
const moment = z.object({ event: text, from: text, to: text, actor: count, at: text });
const leg = z.object({
    id: z.number().nullish(),
    reference: text,
    type: text,
    payment: text,
    status: text,
    amount: money,
    currency: text,
    can_refund: flag,
    created_at: text,
});
const amendment = z.object({
    id: z.number(),
    side: text,
    status: text,
    changes: z.record(z.string(), z.unknown()).nullish(),
    delta: money,
    total: money,
    tax_amount: money,
    fees: charges,
    bands: charges,
    nights: count,
    starts_at: text,
    ends_at: text,
    notes: text,
    expires_at: text,
    accepted_at: text,
    applied_at: text,
    user: maybeObject(person),
});
const line = z.object({
    id: z.number(),
    catalog: z.object({ id: z.number().nullish(), name: text, type: text, image: text }).nullish(),
    quantity: count,
    amount: money,
    status: text,
    stage: text,
});
const terms = z.object({
    journey_shape: text,
    price_id: z.number().nullish(),
    price_version: count,
    fulfillment: z.record(z.string(), z.unknown()).nullish(),
}).loose().nullish();

export const order = z.object({
    id: z.number(),
    name: text,
    image: text,
    qrcode: text,
    attachments: z.array(attachment).nullish(),
    secret_key: text,
    status: text,
    stage: text,
    next_stages: z.array(z.string()).nullish(),
    payment_state: text,
    pay_type: text,
    paid: flag,
    refunded: flag,
    deleted: flag,
    quantity: count,
    adults: count,
    children: count,
    infants: count,
    pets: z.union([z.boolean(), z.number()]).nullish(),
    nights: count,
    applicants: z.array(z.object({ name: text, birth_date: text, nationality: text, residency: text })).nullish(),
    answers: charges,
    eligibility: text,
    eligibility_rule: text,
    currency: text,
    amount: money,
    unit_price: money,
    total_amount: money,
    live_amount: money,
    paid_amount: money,
    overpaid_amount: money,
    remaining_amount: money,
    refunded_amount: money,
    refundable_amount: money,
    first_payment_floor: money,
    tax_percent: decimal,
    tax_amount: money,
    discount: money,
    offer_discount: money,
    level_discount: money,
    discounts,
    coupon_code: text,
    fees: money,
    fees_kept: money,
    fee_lines: charges,
    bands: charges,
    on_site: money,
    deposit_percent: decimal,
    deposit_hold: money,
    deposit_claimed: money,
    deposit_released_at: text,
    penalty_percent: decimal,
    cancel_cost: money,
    refund_percent_now: decimal,
    refund_schedule: z.unknown().optional(),
    refund_until_stage: text,
    contract: terms,
    allow_cancel: flag,
    allow_refund: flag,
    allow_pay_later: flag,
    can_cancel: flag,
    can_refund: flag,
    can_pay: flag,
    can_review: flag,
    can_amend: flag,
    can_receive: flag,
    can_revise: flag,
    can_return: flag,
    amendment: maybeObject(amendment),
    amendment_token: text,
    revisions: count,
    revisions_left: count,
    delivery: text,
    delivery_id: z.number().nullish(),
    courier: maybeObject(person),
    delivered_at: text,
    received_at: text,
    return_quantity: count,
    return_reason: text,
    return_verdict: text,
    return_restock: flag,
    return_requested_at: text,
    returned_at: text,
    inspected_at: text,
    digital_assets: z.array(z.object({ name: text, type: text, size: count, path: text })).nullish(),
    email: text,
    phone: text,
    language: text,
    country: text,
    city: text,
    address: text,
    notes: text,
    cancel_notes: text,
    parent_id: z.number().nullish(),
    starts_at: text,
    ends_at: text,
    scheduled_at: text,
    cancel_before: text,
    refund_before: text,
    cancelled_at: text,
    completed_at: text,
    created_at: text,
    updated_at: text,
    paid_at: text,
    reviews: count,
    timeline: z.array(moment).nullish(),
    lines: z.array(line).nullish(),
    catalog: z.object({
        id: z.number().nullish(),
        name: text,
        slug: text,
        type: text,
        subtype: text,
        image: text,
        image_variants: maybeObject(z.record(z.string(), z.string().nullable())),
    }).nullish(),
    coupon: maybeObject(z.object({ id: z.number(), code: text, name: text }).loose()),
    offer: maybeObject(z.object({ id: z.number(), name: text, type: text, value_type: text, rate: decimal }).loose()),
    transaction: leg.nullish(),
    transactions: z.array(leg).nullish(),
    user: maybeObject(person),
    vendor: maybeObject(person),
});
const binding = { gateway_id: id.optional(), payment_currency: currency.optional() };
export const payment = {
    ...binding,
    amount: amount.optional(),
    confirm_code: confirmCode.optional(),
    redirect_url: httpUrl.optional(),
    failed_url: httpUrl.optional(),
    idempotency_key: z.string().max(100).optional(),
};
const contact = {
    name: z.string().max(200).optional(),
    email: z.union([z.email(), z.literal("")]).optional(),
    phone: z.string().max(30).optional(),
    language: z.string().max(10).optional(),
    country: z.string().max(255).optional(),
    state: z.string().max(255).optional(),
    city: z.string().max(255).optional(),
    zip_code: z.string().max(255).optional(),
    address: z.string().max(255).optional(),
    notes: z.string().max(255).optional(),
};
export const intent = z.object({
    id: z.number().nullish(),
    reference: text,
    order_id: z.number().nullish(),
    manual: flag,
    pay_url: text,
    pay_data: z.object({ pay_url: text }).nullish(),
});

const country = z.string().regex(/^[A-Z]{2}$/);
const applicant = z.strictObject({
    name: z.string().min(2).max(200),
    birth_date: z.iso.date(),
    nationality: country.optional(),
    residency: country.optional(),
});
const answers = z.record(z.string().regex(/^[a-zA-Z0-9_-]{1,100}$/), z.union([answerRow, z.array(answerRow).max(100)]));

const bookingLine = z.strictObject({
    quantity: quantity.default(1),
    starts_at: date.optional(),
    ends_at: date.optional(),
    adults: guests.optional(),
    children: guests.optional(),
    infants: count.optional(),
    pets: z.boolean().optional(),
    tier: z.string().max(100).optional(),
    smoking: z.boolean().optional(),
    applicants: z.array(applicant).min(1).max(100).optional(),
    answers: answers.optional(),
});
const addon = bookingLine.extend({ catalog_id: id, answers: z.union([answers, z.array(answerLine)]).optional() });
export const booking = bookingLine.extend({ addons: z.array(addon).max(100).optional() });
export const coupon = { coupon_code: z.string().max(100).optional() };
const purchase = booking.extend({ productId: id, ...coupon, ...binding });
export const settlement = { ...payment, ...contact, quote_token: quoteToken.optional(), pay_type: z.enum(["wallet", "directly", "later"]) };
export const placed = z.object({ order, payment: intent.nullish() });
export const checkout = { response: { data: "$", fields: { order: "data", payment: "meta.payment" } } };

const quote = priced.extend({ quote_token: z.string(), deposit_percent: decimal, display: priced.nullish() });
const payable = z.object({ currency: text, remaining: decimal, leg: decimal });
const paymentQuote = payable.extend({ quote_token: z.string(), display: payable.nullish() });
const orderId = { orderId: id };
const reason = z.string().max(3000).optional();
const change = {
    quantity: quantity.optional(),
    starts_at: date.optional(),
    ends_at: date.optional(),
    adults: guests.optional(),
    children: guests.optional(),
    infants: count.optional(),
    pets: z.boolean().optional(),
    applicants: z.array(applicant).min(1).max(100).optional(),
    answers: answers.optional(),
};

const touches = ["cart", "products", "reviews", "wallet", "transactions", "notifications"];

export default feature({ execution: "client", permissions: ["user"], touches }, {
    list: get("/orders", list, many(order)),
    view: get("/orders/{orderId}", orderId, order),
    preview: post("/orders/preview", purchase, quote, { request: { fields: { productId: "catalog_id" } } }),
    quote: post("/orders/{orderId}/quote", { ...orderId, ...binding, amount: amount.optional() }, paymentQuote),
    pay: post("/orders/{orderId}/pay", { ...orderId, ...payment, quote_token: quoteToken }, intent),
    refund: post("/orders/{orderId}/refund", { ...orderId, amount: amount.optional() }, order),
    review: post("/orders/{orderId}/review", { ...orderId, ...reviewInput }, review),
    update: put("/orders/{orderId}", { ...orderId, ...contact }, order),
    cancel: post("/orders/{orderId}/cancel", { ...orderId, reason }, order, { request: { fields: { reason: "cancel_notes" } } }),
    checkout: post("/catalogs/{productId}/checkout", purchase.extend(settlement), placed, checkout),
    receive: post("/orders/{orderId}/receive", orderId, order),
    revise: post("/orders/{orderId}/revise", { ...orderId, notes: z.string().max(3000).optional() }, order),
    return: post("/orders/{orderId}/return", { ...orderId, quantity: quantity.optional(), reason }, order),
    amend: post("/orders/{orderId}/amend", { ...orderId, ...change, notes: z.string().max(3000).optional() }, order),
    amendments: get("/orders/{orderId}/amendments", { ...orderId, ...list }, many(amendment)),
    acceptAmendment: post("/orders/{orderId}/amendments/{amendmentId}/accept", {
        ...orderId, amendmentId: id, quote_token: quoteToken,
    }, order),
    declineAmendment: post("/orders/{orderId}/amendments/{amendmentId}/decline", { ...orderId, amendmentId: id, notes: reason }, order),
    reviews: get("/orders/{orderId}/reviews", { ...orderId, ...list }, many(review)),
    ...engage("/orders/{orderId}", orderId, ["like", "dislike", "unreact", "reaction", "report"]),
    ...trash("/orders", orderId),
});
