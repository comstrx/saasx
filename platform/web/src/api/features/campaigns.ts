import { z } from "../../lib/providers/schema.ts";
import { browse } from "../core/dsl.ts";
import { id, text } from "../core/fields.ts";
import { offer } from "./offers.ts";

const campaign = z.object({
    id,
    title: text,
    type: text,
    state: text,
    content: text,
    image: text,
    starts_at: text,
    expires_at: text,
    offers: z.array(offer).nullish(),
    faqs: z.array(z.record(z.string(), z.unknown())).nullish(),
});

export default browse("/campaigns", { campaignId: id }, campaign);
