import { z } from "../../lib/providers/schema.ts";
import { engage, feature, get, many, trash } from "../core/dsl.ts";
import { flag, id, list, text } from "../core/fields.ts";

const referral = z.object({
    id: z.number(),
    active: flag,
    created_at: text,
    referred: z.object({ id: z.number(), name: text, image: text }).nullish(),
});

const referralId = { referralId: id };

export default feature({ execution: "client", permissions: ["user"], touches: ["rewards"] }, {
    list: get("/referrals", list, many(referral)),
    view: get("/referrals/{referralId}", referralId, referral),
    ...engage("/referrals/{referralId}", referralId, ["report"]),
    ...trash("/referrals", referralId),
});
