import { z } from "../../lib/providers/schema.ts";
import { del, engage, feature, get, many, post, put } from "../core/dsl.ts";
import { ack, id, list, person, text } from "../core/fields.ts";
import { authReply, password, phone } from "./auth.ts";
import { intent, payment } from "./orders.ts";
import { plan } from "./plans.ts";
import { subscription } from "./subscriptions.ts";

const tenant = z.object({
    id: z.number(),
    name: text,
    type: text,
    phone: text,
    email: text,
    host: text,
    image: text,
    subscription: subscription.partial().nullish(),
    plan: plan.partial().nullish(),
    owner: person.nullish(),
    admin: person.nullish(),
});
const profile = {
    name: z.string().min(2).max(200),
    email: z.email().optional(),
    phone: phone.optional(),
    domain_name: z.string().max(253).optional(),
};
const tenantId = { tenantId: id };
const duration = z.enum(["monthly", "yearly", "lifetime"]);
const checkout = z.object({ data: intent.partial().nullish() }).loose().nullish();
const root = { response: { data: "$" } };

export default feature({ execution: "client" }, {
    landing: post("/tenants/landing", {
        ...profile,
        email: z.email(),
        password,
        password_confirmation: password,
        plan_id: id,
        duration,
        coupon_code: z.string().max(100).optional(),
        ...payment,
    }, z.object({ data: authReply, payment: checkout }), root),
    list: get("/tenants", list, many(tenant)),
    view: get("/tenants/{tenantId}", tenantId, tenant),
    create: post("/tenants", {
        ...profile,
        admin_name: z.string().min(2).max(200).optional(),
        admin_phone: phone.optional(),
        admin_email: z.email(),
        admin_password: password,
        admin_password_confirmation: password,
        plan_id: id,
        duration,
        coupon_code: z.string().max(100).optional(),
        ...payment,
    }, z.object({ data: tenant, payment: checkout }), root),
    update: put("/tenants/{tenantId}", { ...tenantId, ...profile, name: profile.name.optional() }, tenant),
    delete: del("/tenants/{tenantId}", tenantId, ack),
    deleteMany: del("/tenants", { ids: z.array(id).min(1).max(100) }, ack),
    renew: post("/tenants/{tenantId}/renew", { ...tenantId, ...payment }, z.object({ payment: checkout }), root),
    ...engage("/tenants/{tenantId}", tenantId, ["report"]),
});
