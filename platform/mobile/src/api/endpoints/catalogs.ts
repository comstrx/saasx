import { z } from "zod";
import { call, page, paged } from "@/api/client";
import { decimal, dict, maybeObject, money, oneOf, type Supports, supportsOf, variants } from "@/api/contracts";
import { key } from "@/std/key";

const spot = z.object({
    name: z.string().nullable().optional(),
    latitude: decimal,
    longitude: decimal,
}).nullable().optional();

const location = z.object({
    latitude: decimal,
    longitude: decimal,
    address: z.string().nullable().optional(),
    city: spot,
    country: spot,
    geo: spot,
}).nullable().optional();

const attachment = z.object({
    type: z.string().nullable().optional(),
    path: z.string().nullable().optional(),
    url: z.string().nullable().optional(),
    variants,
});

const row = z.object({
    id: z.number(),
    name: z.string(),
    slug: z.string().nullable().optional(),
    type: z.string(),
    capabilities: z.array(z.string()).nullable().optional(),
    image: z.string().nullable().optional(),
    image_variants: variants,
    attachments: z.array(attachment).nullable().optional(),
    images: z.array(attachment).nullable().optional(),
    min_price: money,
    sale_price: money,
    offer: maybeObject(z.object({
        rate: decimal,
        expires_at: z.string().nullable().optional(),
    })),
    price_context: z.object({
        unit: z.string().nullable().optional(),
        quantity: decimal,
    }).nullable().optional(),
    rating: decimal,
    reviews: z.number().nullable().optional(),
    in_favorites: z.boolean().nullable().optional(),
    in_cart: z.boolean().nullable().optional(),
    sale_closed: z.boolean().nullable().optional(),
    stock: z.number().nullable().optional(),
    created_at: z.string().nullable().optional(),
    description: z.string().nullable().optional(),
    duration: decimal,
    duration_unit: z.string().nullable().optional(),
    capacity: decimal,
    digital: z.boolean().nullable().optional(),
    orders: z.number().nullable().optional(),
    checkin_time: z.string().nullable().optional(),
    min_stay: z.number().nullable().optional(),
    geo: location,
});

export const listingRow = row;

export const listingRows = z.array(row);

export type LocationRow = z.infer<typeof location>;

export type AttachmentRow = z.infer<typeof attachment>;

export type ListingRow = z.infer<typeof row>;

export type CatalogQuery = {
    type?: string;
    sort?: string;
    limit?: number;
    featured?: boolean;
    search?: string;
    vendor_id?: number;
};

const plain = new Set([ "sort", "limit", "page", "search", "view" ]);

export const tiny = "tiny";

const query = ( params: Record<string, unknown> ) => Object.entries(params)
    .filter(([ , value ]) => value !== undefined && value !== null && value !== "" )
    .map(([ name, value ]) => plain.has(name)
        ? `${ name }=${ encodeURIComponent(String(value)) }`
        : `filters[${ name }]=${ encodeURIComponent(String(value)) }` )
    .join("&");

const census = z.object({
    facets: z.object({ type: maybeObject(z.record(z.string(), z.number())) }).nullable().optional(),
});

type Census = Readonly<Record<string, number>>;

export const catalogs = {

    census: async (): Promise<Census> => {

        const answer = await paged({ path: `catalogs?facets=type&limit=1&view=${ tiny }`, schema: listingRows });
        const read = census.safeParse(answer.meta);

        return oneOf(read.success ? read.data.facets?.type : null) ?? {};

    },

    list: ( params: CatalogQuery ): Promise<readonly ListingRow[]> => {

        const search = query({ ...params, limit: params.limit ?? 12, view: tiny });

        return call({ path: `catalogs${ search ? `?${ search }` : "" }`, schema: listingRows });

    },

    recent: ( limit = 8 ): Promise<readonly ListingRow[]> =>
        call({ path: `home/recently-catalogs?limit=${ limit }&view=${ tiny }`, schema: listingRows }),

    view: ( id: number ) =>
        call({ path: `catalogs/${ id }/view`, method: "POST", idempotencyKey: key.attempt(`view:${ id }`) }),

};

const trait = z.object({
    key: z.string().nullable().optional(),
    name: z.string().nullable().optional(),
    label: z.string().nullable().optional(),
    group: z.string().nullable().optional(),
    icon: z.string().nullable().optional(),
    sort: decimal,
    included: z.boolean().nullable().optional(),
    value: z.union([ z.string(), z.number(), z.boolean() ]).nullable().optional(),
    value_label: decimal,
});

const traits = z.array(trait).nullable().optional();

const grouped = z.union([ z.record(z.string(), traits), z.array(trait) ]).nullable().optional();

const policy = z.object({
    id: z.number(),
    key: z.string().nullable().optional(),
    type: z.string().nullable().optional(),
    group: z.string().nullable().optional(),
    title: z.string().nullable().optional(),
    description: z.string().nullable().optional(),
    refundable: z.boolean().nullable().optional(),
    free_before_hours: z.number().nullable().optional(),
    penalty_percent: decimal,
});

const hostRow = z.object({
    id: z.number(),
    name: z.string().nullable().optional(),
    image: z.string().nullable().optional(),
    verified: z.boolean().nullable().optional(),
    rating: decimal,
    reviews: z.number().nullable().optional(),
    catalogs: z.number().nullable().optional(),
    member_since: z.string().nullable().optional(),
    response_rate: decimal,
    response_time: z.string().nullable().optional(),
}).nullable().optional();

const reviewer = z.object({
    id: z.number(),
    name: z.string().nullable().optional(),
    image: z.string().nullable().optional(),
});

const reviewRow = z.object({
    id: z.number(),
    title: z.string().nullable().optional(),
    content: z.string().nullable().optional(),
    rating: decimal,
    created_at: z.string().nullable().optional(),
    user: reviewer.nullable().optional(),
});

export const reviewRows = z.array(reviewRow);

export type ReviewRow = z.infer<typeof reviewRow>;

type ReviewAsk = {
    sort?: string;
    search?: string;
    page?: number;
    limit?: number;
    spread?: boolean;
};

export type ReviewPage = {
    rows: readonly ReviewRow[];
    supports: Supports;
    pages: number;
    spread: Readonly<Record<string, number>>;
};

const ratingFacet = z.object({ facets: z.object({ rating: z.record(z.string(), z.coerce.number()) }) });

const openDays = z.object({
    currency: z.string().nullable().optional(),
    days: z.array(z.object({
        date: z.string(),
        open: z.boolean().nullable().optional(),
        units: z.number().nullable().optional(),
        price: money,
    })),
});

const seat = z.object({
    id: z.number(),
    name: z.string().nullable().optional(),
    sku: z.string().nullable().optional(),
    min_price: money,
    stock: z.number().nullable().optional(),
    adults: z.number().nullable().optional(),
    children: z.number().nullable().optional(),
    fits: z.boolean().nullable().optional(),
    sold_out: z.boolean().nullable().optional(),
    features: dict(z.union([ z.string(), z.number() ]).nullable()),
});

const addon = z.object({
    id: z.number(),
    name: z.string().nullable().optional(),
    price: money,
});

const poi = z.object({
    id: z.number(),
    name: z.string().nullable().optional(),
    description: z.string().nullable().optional(),
    kind: z.string().nullable().optional(),
    latitude: decimal,
    longitude: decimal,
});

const faq = z.object({
    group: z.string().nullable().optional(),
    key: z.string().nullable().optional(),
    question: z.string().nullable().optional(),
    answer: z.string().nullable().optional(),
    sort: z.number().nullable().optional(),
});

const full = z.object({
    id: z.number(),
    name: z.string(),
    slug: z.string().nullable().optional(),
    type: z.string().nullable().optional(),
    subtype: z.string().nullable().optional(),
    category: z.object({ id: z.number(), name: z.string().nullable().optional() }).nullable().optional(),
    capabilities: z.array(z.string()).nullable().optional(),
    description: z.string().nullable().optional(),
    instructions: z.string().nullable().optional(),
    image: z.string().nullable().optional(),
    image_variants: variants,
    attachments: z.array(attachment).nullable().optional(),
    min_price: money,
    total_price: money,
    price_context: z.object({
        unit: z.string().nullable().optional(),
        quantity: decimal,
    }).nullable().optional(),
    rating: decimal,
    reviews: z.number().nullable().optional(),
    orders: z.number().nullable().optional(),
    views: z.number().nullable().optional(),
    sku: z.string().nullable().optional(),
    in_favorites: z.boolean().nullable().optional(),
    in_cart: z.boolean().nullable().optional(),
    sale_closed: z.boolean().nullable().optional(),
    stock: z.number().nullable().optional(),
    delivery: z.string().nullable().optional(),
    digital: z.boolean().nullable().optional(),
    capacity: z.number().nullable().optional(),
    min_quantity: z.number().nullable().optional(),
    max_quantity: z.number().nullable().optional(),
    duration: z.number().nullable().optional(),
    duration_unit: z.string().nullable().optional(),
    checkin_time: z.string().nullable().optional(),
    checkout_time: z.string().nullable().optional(),
    adults: z.number().nullable().optional(),
    children: z.number().nullable().optional(),
    min_stay: z.number().nullable().optional(),
    max_stay: z.number().nullable().optional(),
    starts_at: z.string().nullable().optional(),
    ends_at: z.string().nullable().optional(),
    allow_pay_later: z.boolean().nullable().optional(),
    transport_mode: z.string().nullable().optional(),
    offer: maybeObject(z.object({
        rate: decimal,
        discount: money,
        expires_at: z.string().nullable().optional(),
    })),
    features: grouped,
    details: grouped,
    rules: traits,
    sellables: z.array(seat).nullable().optional(),
    extras: z.array(addon).nullable().optional(),
    pois: z.array(poi).nullable().optional(),
    faqs: z.array(faq).nullable().optional(),
    policies: z.array(policy).nullable().optional(),
    host: hostRow,
    vendor: hostRow,
    geo: location,
    origin: location,
    destination: location,
});

export type OpenDaysRow = z.infer<typeof openDays>;

export type DetailRow = z.infer<typeof full>;

export const detail = {

    show: ( id: number, guests: { adults: number; children: number } ): Promise<DetailRow> =>
        call({ path: `catalogs/${ id }?adults=${ guests.adults }&children=${ guests.children }`, schema: full }),

    similar: ( id: number, limit = 8 ): Promise<readonly ListingRow[]> =>
        call({ path: `catalogs/${ id }/similar?limit=${ limit }&view=${ tiny }`, schema: listingRows }),

    favorite: ( id: number, on: boolean, attempt: string ) =>
        call({ path: `catalogs/${ id }/${ on ? "favorite" : "unfavorite" }`, method: "POST", idempotencyKey: attempt }),

    availability: ( id: number, from: string, to: string ): Promise<OpenDaysRow> =>
        call({ path: `catalogs/${ id }/availability?from=${ from }&to=${ to }`, schema: openDays }),

    reviews: async ( id: number, ask: ReviewAsk = {} ): Promise<ReviewPage> => {

        const terms = [
            `sort=${ ask.sort ?? "newest" }`,
            `limit=${ ask.limit ?? 20 }`,
            `page=${ ask.page ?? 1 }`,
        ];

        const needle = ( ask.search ?? "" ).trim();

        if ( needle ) terms.push(`search=${ encodeURIComponent(needle) }`);
        if ( ask.spread ) terms.push("facets=rating");

        const answer = await paged({ path: `catalogs/${ id }/reviews?${ terms.join("&") }`, schema: reviewRows });
        const facet = ratingFacet.safeParse(answer.meta);

        return { rows: answer.data, supports: supportsOf(answer.meta), pages: Number(answer.meta.pages ?? 1), spread: facet.success ? facet.data.facets.rating : {} };

    },

    report: ( id: number, reason: string, note: string, attempt: string ) =>
        call({
            path: `catalogs/${ id }/report`,
            method: "POST",
            body: { reason, title: reason, content: note || reason },
            idempotencyKey: attempt,
        }),

};

const saved = z.object({
    id: z.number(),
    catalog: row.nullable().optional(),
});

const savings = z.array(saved);

export type SavedRow = z.infer<typeof saved>;

export const favorites = {

    list: ( at = 1 ) => page({ path: "favorites?limit=20", schema: savings }, at),

};
