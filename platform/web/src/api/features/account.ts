import { z } from "../../lib/providers/schema.ts";
import { del, feature, get, many, post, put } from "../core/dsl.ts";
import { ack, channel, confirmCode, count, currency, decimal, dict, flag, id, imageFile, money, text, uploadFile } from "../core/fields.ts";
import { password, phone, provider, redirect, social } from "./auth.ts";
import { attachment } from "./documents.ts";
import { perk } from "./levels.ts";

const contact = z.enum(["email", "phone"]);
const topic = z.string().regex(/^[a-zA-Z0-9_-]+$/);
const documentType = z.enum(["passport", "national_id", "driver_license"]);
const flags = z.union([z.record(z.string(), z.boolean()), z.array(z.unknown())]).nullish();
const topics = z.union([
    z.record(z.string(), z.object({ enabled: flag, forced: flag, channels: flags })),
    z.array(z.unknown()),
]).nullish();
const place = z.object({
    geo_id: z.number().nullish(),
    country_id: z.number().nullish(),
    city_id: z.number().nullish(),
    latitude: decimal,
    longitude: decimal,
    address: text,
    address_2: text,
    zip_code: text,
    city: z.object({ id: z.number().nullish(), name: text }).nullish(),
    country: z.object({ id: z.number().nullish(), name: text, code: text }).nullish(),
}).nullish();
const wallet = z.object({
    currency: text,
    total_balance: money,
    available_balance: money,
    pending_balance: money,
    points: decimal,
}).nullish();
const referral = z.object({ code: text, path: text, urls: dict(z.string()) }).nullish();
const condition = z.object({
    key: z.string(),
    window: count,
    money: flag,
    required: decimal,
    reached: decimal,
    remaining: decimal,
    met: flag,
});

const identitySubmit = z.strictObject({
    type: documentType, geo_id: id, name: z.string().max(200).optional(), number: z.string().min(1).max(100),
    front_image: uploadFile,
    back_image: uploadFile.optional(),
}).refine(( value ) => value.type === "passport" || !!value.back_image);
const accountPassword = z.strictObject({
    old_password: password.optional(),
    password,
    password_confirmation: password,
    logout: z.boolean().default(true),
}).refine(( value ) => value.password === value.password_confirmation);
const accountPreferences = {
    notify_prefs: z.record(topic, z.object({
        enabled: z.boolean().optional(),
        channels: z.record(topic, z.boolean()).optional(),
    })).optional(),
    confirmation_way: channel.or(z.literal("none")).optional(),
    language: z.string().max(10).optional(),
    currency: currency.optional(),
    theme: z.enum(["light", "dark", "system"]).optional(),
};
const location = {
    latitude: z.number().min(-90).max(90).optional(),
    longitude: z.number().min(-180).max(180).optional(),
    country: z.string().min(2).max(100).optional(),
    city: z.string().min(1).max(100).optional(),
    address: z.string().max(500).optional(),
    address_2: z.string().max(500).optional(),
    zip_code: z.string().max(40).optional(),
};
const blank = { response: { empty: true } };
const files = z.object({ files: z.array(attachment) });
const outcome = z.object({ fields: z.record(z.string(), z.unknown()) });
const proof = { password: password.optional(), confirm_code: confirmCode.optional() };

const account = z.object({
    user: z.object({
        id: z.number(),
        name: text,
        email: text,
        phone: text,
        image: text,
        verified: flag,
        email_verified: flag,
        phone_verified: flag,
        identity_status: text,
        has_password: flag,
        level: count,
        referral,
        language: text,
        currency: text,
        theme: text,
        orders: count,
        reviews: count,
        coupons: count,
        referrals: count,
        wallet,
        geo: place,
        permissions: z.array(z.string()).nullish(),
    }),
    tenant: z.object({ id: z.number(), name: text, type: text, host: text }).nullish(),
});
const avatar = z.object({ image: z.string() });
const identityRecord = z.object({
    id: z.number().optional(),
    type: documentType.nullish(),
    status: text,
    verified: flag,
    name: text,
    number: text,
    notes: text,
    expires_at: text,
    reviewed_at: text,
    geo: z.object({ id: z.number(), name: text }).nullish(),
});
const identityOptions = z.object({
    countries: z.array(z.object({ id: z.number(), code: text, name: text })),
    types: z.array(z.object({
        value: documentType,
        documents: z.array(z.object({ field: z.enum(["front_image", "back_image"]), required: z.boolean() })),
    })),
    constraints: z.object({ mime_types: z.array(z.string()), max_size: z.number() }),
});
const preferences = z.object({
    theme: text,
    currency: text,
    language: text,
    confirmation_way: text,
    notify_prefs: topics,
});
const contactChallenge = z.object({
    pending: text,
    verifying_over: text,
    field: contact.nullish(),
    channel: text,
    destination: text,
    length: count,
    verified: flag,
    expires_in: count,
    resend_after: count,
});
const loyalty = z.object({
    level: z.object({
        current: z.object({ id: z.number(), rank: count, name: text, image: text }).nullable(),
        perks: z.array(perk),
        progress: z.object({ next_rank: count, conditions: z.array(condition) }).nullable(),
    }),
});
const earnedRewards = z.object({
    rewards: z.array(z.object({
        id: z.number(),
        occurrence: text,
        created_at: text,
        snapshot: z.object({ type: text, amount: money, points: decimal }).nullish(),
        reward: z.object({ key: text, type: text }).nullish(),
    })),
});
const linkedSocial = z.object({
    id: z.number(),
    provider: z.string(),
    provider_id: text,
    name: text,
    email: text,
    active: flag,
});

export default feature({ execution: "client", permissions: ["user"], touches: ["sessions", "credentials"] }, {
    read: get("/account", {}, account),
    me: get("/account/me", {}, account),
    update: put("/account", { name: z.string().min(2).max(200).optional(), ...location }, outcome),
    unlock: post("/account/unlock", proof, ack),
    logoutOthers: post("/account/logout-others", {}, ack),
    files: get("/account/files", {}, files),
    uploadFiles: post("/account/files", { files: z.array(uploadFile).min(1).max(8) }, files, { encoding: "multipart" }),
    deleteFiles: del("/account/files", { ids: z.array(id).min(1).max(100) }, ack),
    registerDevice: post("/account/devices", {
        token: z.string().min(1).max(4096),
        platform: z.enum(["ios", "android", "web"]),
        locale: z.string().max(10).optional(),
    }, ack),
    removeDevice: del("/account/devices/{token}", { token: z.string().min(1).max(4096) }, ack),
    attachSocial: post("/account/attach-social", {
        provider,
        code: z.string().min(1).max(4096),
        redirect_uri: z.url().optional(),
        code_verifier: z.string().max(200).optional(),
    }, many(linkedSocial), { response: { data: "data.socials" } }),
    image: post("/account/image", { image: imageFile }, avatar, { encoding: "multipart" }),
    removeImage: del("/account/image", {}, ack),
    identity: get("/account/identity", {}, identityRecord, blank),
    identityOptions: get("/account/identity/options", {}, identityOptions),
    submitIdentity: post("/account/identity", identitySubmit, identityRecord, { encoding: "multipart" }),
    preferences: get("/account/settings", {}, preferences),
    settings: put("/account/settings", accountPreferences, ack),
    name: put("/account/name", { name: z.string().min(2).max(200) }, ack),
    email: put("/account/email", { email: z.email(), password: password.optional() }, contactChallenge, blank),
    phone: put("/account/phone", { phone, password: password.optional() }, contactChallenge, blank),
    password: put("/account/password", accountPassword, ack),
    location: put("/account/location", location, z.object({ geo: place })),
    confirm: post("/account/confirm-contact", { field: contact, code: z.string().min(1).max(20) }, ack),
    sendCode: post("/account/send-code", { field: contact }, contactChallenge, blank),
    logout: post("/account/logout", {}, ack),
    logoutAll: post("/account/logout-all", {}, ack),
    deactivate: post("/account/deactivate", proof, ack),
    delete: post("/account/request-deletion", proof, ack),
    loyalty: get("/account/level", {}, loyalty),
    rewards: get("/account/rewards", {}, earnedRewards),
    socials: get("/account/socials", {}, many(linkedSocial), { response: { data: "data.socials" } }),
    linkSocial: get("/account/attach-social/{provider}/redirect", social, redirect),
    unlinkSocial: post("/account/unattach-social/{provider}", { provider, provider_id: z.string().max(200).optional() }, ack),
});
