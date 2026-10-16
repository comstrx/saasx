import { del, document, type Endpoint, feature, get, localized, many, need, password, post, put, z } from "engine/api";

const money = z.object({ amount: z.string(), currency: z.string() }).nullish();
const catalog = z.object({
    id: z.number(),
    updated_at: z.string().nullish(),
    name: z.string(),
    slug: z.string().nullish(),
    type: z.string().nullish(),
    subtype: z.string().nullish(),
    image: z.string().nullish(),
    rating: z.coerce.number().nullish(),
    min_price: money,
    sale_price: money,
    featured: z.boolean().nullish(),
    in_stock: z.boolean().nullish(),
});
const managed = catalog.extend({
    created_at: z.string().nullish(),
    deleted_at: z.string().nullish(),
    active: z.boolean().nullish(),
    stock: z.number().nullish(),
    capacity: z.number().nullish(),
    starts_at: z.string().nullish(),
    ends_at: z.string().nullish(),
    description: z.string().nullish(),
});
const challenge = z.object({
    status: z.string(),
    challenge_token: z.string(),
    channel: z.string().nullish(),
    destination: z.string().nullish(),
    length: z.number().nullish(),
});
const user = z.object({
    id: z.number(),
    name: z.string(),
    email: z.string().nullish(),
    phone: z.string().nullish(),
    role: z.string().nullish(),
    slug: z.string().nullish(),
    image: z.string().nullish(),
    gender: z.string().nullish(),
    birth_date: z.string().nullish(),
    language: z.string().nullish(),
    currency: z.string().nullish(),
    theme: z.string().nullish(),
    permissions: z.array(z.string()).default([]),
});
const session = z.object({ token: z.string(), user });
const credentials = { email: z.email(), password: password };
const otp = { challenge_token: z.string(), otp: z.string().min(4).max(8) };
const catalogType = z.enum(["hotel", "room", "property", "tour", "travel", "ticket", "visa", "product", "service", "event", "insurance"]);
const catalogSubtype = z.enum(["physical", "digital", "online", "offline", "internal", "external", "individual", "collective"]);
const sorts = z.enum(["newest", "oldest", "lowest_price", "highest_price", "lowest_rated", "highest_rated", "highest_viewed"]);
const editable = {
    name: localized(2),
    subtype: catalogSubtype.optional(),
    stock: z.coerce.number().int().min(0).optional(),
    capacity: z.coerce.number().int().min(0).optional(),
    featured: z.boolean().optional(),
    starts_at: z.iso.date().optional(),
    ends_at: z.iso.date().optional(),
};
const ack = z.unknown().nullable();
const byId = { id: z.coerce.number().int().positive() };
const limit = z.number().int().positive().max(50).optional();
const position = {
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    address: z.string().max(255).optional(),
};
const device = { token: z.string().min(8), platform: z.enum(["android", "ios", "web"]), locale: z.string().max(10).optional() };
const translation = z.object({ locale: z.string(), name: z.string().nullish(), description: z.string().nullish() });

export const endpoints = {
    site: document("content"),
    catalogs: feature({ cache: 30 }, {
        list: get("/catalogs", {
            page: z.number().int().positive().optional(),
            limit,
            search: z.string().max(100).optional(),
            sort: z.string().max(40).optional(),
            type: z.string().max(40).optional(),
        }, many(catalog), { request: { fields: { type: "query:filters[type]" } } }),
        view: get("/catalogs/{id}", byId, catalog),
    }),
    auth: feature({ execution: "client", cache: 0 }, {
        login: post("/auth/login", credentials, challenge),
        verify: post("/auth/verify-otp", otp, session),
    }),
    account: feature({ execution: "client", cache: 0, permissions: ["user"], touches: ["account"] }, {
        me: get("/account/me", {}, user, { response: { data: "data.user" } }),
        logout: post("/account/logout", {}, ack),
        update: put("/account", { name: z.string().min(2).max(80) }, ack),
        locate: put("/account/location", position, ack),
        avatar: post("/account/image", { image: z.file() }, z.object({ image: z.string().nullish() }), { encoding: "multipart" }),
        device: post("/account/devices", device, ack),
    }),
    staff: feature({ execution: "client", cache: 0 }, {
        login: post("/admin/auth/login", credentials, challenge),
        verify: post("/admin/auth/verify-otp", otp, session),
    }),
    manage: feature({ execution: "client", cache: 0, permissions: ["user"], touches: ["manage"] }, {
        me: get("/admin/account/me", {}, user, { response: { data: "data.user" } }),
        logout: post("/admin/account/logout", {}, ack),
        list: need(["view_catalogs"], get("/admin/catalogs", {
            page: z.number().int().positive().optional(),
            limit,
            search: z.string().max(100).optional(),
            sort: sorts.optional(),
            type: catalogType.optional(),
            trashed: z.boolean().optional(),
        }, many(managed), { request: { fields: { type: "query:filters[type]", trashed: "query:filters[trashed]" } } })),
        view: need(["view_catalogs"], get("/admin/catalogs/{id}", byId, managed)),
        texts: get("/admin/catalogs/{id}/translations", { ...byId, limit }, many(translation)),
        create: need(["add_catalogs"], post("/admin/catalogs", { type: catalogType, ...editable }, managed)),
        update: need(["edit_catalogs"], put("/admin/catalogs/{id}", { ...byId, type: catalogType, ...editable }, managed)),
        remove: need(["delete_catalogs"], del("/admin/catalogs/{id}", byId, ack)),
        restore: need(["delete_catalogs"], post("/admin/catalogs/{id}/restore", byId, managed)),
    }),
} as const;

export const entities = { catalog: { parameter: "id" } } as const satisfies Record<string, { parameter: string }>;

export type Endpoints = typeof endpoints;
export type Feature = keyof Endpoints & string;
export type OperationOf<F extends Feature> = keyof Endpoints[F] & string;
export type EndpointOf<F extends Feature, O extends OperationOf<F>> = Endpoints[F][O] extends Endpoint ? Endpoints[F][O] : never;
export type EntityKind = keyof typeof entities & string;
