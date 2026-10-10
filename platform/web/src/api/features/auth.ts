import { z } from "../../lib/providers/schema.ts";
import { feature, get, post } from "../core/dsl.ts";
import { ack, channel, count, flag, httpUrl, id, text } from "../core/fields.ts";

const token = z.string().min(1).max(4096);
const otp = z.string().regex(/^[0-9]{4,12}$/);

export const password = z.string().min(1).max(256);
export const phone = z.string().min(7).max(25);
export const provider = z.string().regex(/^[a-z0-9_-]+$/);

const identifier = { email: z.email().optional(), phone: phone.optional() };
const user = z.object({
    id,
    name: text,
    email: text,
    phone: text,
    image: text,
    verified: flag,
    permissions: z.array(z.string()).nullish(),
    language: text,
    currency: text,
    theme: text,
});
const challenge = z.object({
    status: z.enum(["otp_required", "otp_pending", "link_sent"]),
    challenge_token: token.optional(),
    channel,
    destination: z.string(),
    length: count,
    locked: flag,
    retry_at: text,
    expires_at: text,
});

export const authReply = z.object({
    user: user.optional(),
    token: token.optional(),
    verification: z.object({
        steps: z.union([z.record(z.string(), z.boolean()), z.array(z.never())]).nullish(),
        remained: z.array(z.string()).optional(),
    }).nullish(),
    ...challenge.partial().shape,
}).refine(( value ) => {

    const session = !!(value.token && value.user);
    const challenged = !!(value.status && value.channel && value.destination && (value.status === "link_sent" || value.challenge_token));

    return session || challenged;

});

export type SessionUser = z.infer<typeof user>;

const login = z.strictObject({ ...identifier, password }).refine(( value ) => !!value.email !== !!value.phone);
const registration = z.strictObject({
    name: z.string().min(2).max(200),
    email: z.email(),
    phone,
    password,
    password_confirmation: password,
    promotion_code: z.string().max(64).optional(),
}).refine(( value ) => value.password === value.password_confirmation);
const recovery = z.strictObject(identifier).refine(( value ) => !!value.email !== !!value.phone);
const reset = z.strictObject({
    token: token.optional(),
    challenge_token: token.optional(),
    otp: otp.optional(),
    password,
    password_confirmation: password,
}).refine(( value ) => {

    return value.password === value.password_confirmation && (!!value.token || !!(value.challenge_token && value.otp));

});

export const redirect = z.object({ url: httpUrl });

const exists = z.object({ exists: flag });
const blank = { response: { empty: true } };
export const social = { provider, callback: httpUrl };

export default feature({ execution: "client", touches: ["account", "sessions"] }, {
    login: post("/auth/login", login, authReply),
    register: post("/auth/register", registration, authReply),
    verify: post("/auth/verify-otp", { challenge_token: token, otp }, authReply),
    resend: post("/auth/resend", { challenge_token: token }, authReply),
    recovery: post("/auth/recovery", recovery, authReply),
    reset: post("/auth/reset", reset, ack),
    confirmEmail: post("/auth/confirm-email", { token }, ack),
    providers: get("/auth/social/providers", {}, z.object({ providers: z.array(z.string()) }), { execution: "hybrid" }),
    socialRedirect: get("/auth/social/{provider}/redirect", social, redirect),
    socialExchange: post("/auth/social/exchange", { code: token }, authReply),
    checkEmail: post("/auth/check-email", { email: z.email() }, exists, blank),
    checkPhone: post("/auth/check-phone", { phone }, exists, blank),
    checkToken: post("/auth/check-token", { token }, ack),
});
