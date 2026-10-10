import { z } from "../../lib/providers/schema.ts";
import { engage, feature, get, many, post, put, trash } from "../core/dsl.ts";
import { count, decimal, flag, id, list, maybeObject, picture, tallies, text } from "../core/fields.ts";
import { attachment } from "./documents.ts";

const author = z.object({
    id: z.number(),
    name: text,
    ...picture,
    role: text,
    level: count,
});
const related = z.object({ id: z.number(), title: text, name: text, image: text }).loose();
const thread = z.object({
    id: z.number(),
    title: text,
    content: text,
    attachments: z.array(attachment).nullish(),
    related_type: text,
    related_id: z.number().nullish(),
    related: maybeObject(related),
    ...tallies,
    deleted: flag,
    user: maybeObject(author),
    created_at: text,
    updated_at: text,
});

type Reply = z.output<typeof thread> & { replies?: Reply[] | null };

export const comment = thread.extend({ replies: count });
export const reply: z.ZodType<Reply> = thread.extend({ replies: z.array(z.lazy(() => reply)).nullish() });

export const review = comment.extend({
    rating: decimal,
    kind: text,
    scores: z.record(z.string(), decimal).nullish(),
    published: flag,
    published_at: text,
});

export const reviewInput = {
    title: z.string().max(255).optional(),
    content: z.string().max(65535).optional(),
    rating: z.number().min(0).max(5).optional(),
    scores: z.record(z.string().regex(/^[a-z_]{1,40}$/), z.number().int().min(1).max(5)).optional(),
};

const writing = { title: z.string().max(255).optional(), content: z.string().min(1).max(65535) };
const editing = { ...writing, content: writing.content.optional() };
const complaint = {
    reason: z.string().max(255).optional(), title: z.string().max(255).optional(), content: z.string().min(1).max(65535),
};
const report = z.object({ id: z.number(), reason: text, title: text, content: text, status: text, created_at: text });
const verbs = ["like", "dislike", "unreact", "reaction", "report"] as const;

function discussion<const K extends string, const T extends z.ZodType> ( route: string, key: K, item: T, edit: z.ZodRawShape ) {

    const input = { [key]: id } as { [P in K]: typeof id };
    const base = `${route}/{${key}}`;
    const client = { execution: "client" } as const;

    return {
        list: get(route, list, many(item), client),
        view: get(base, input, item, client),
        replies: get(`${base}/replies`, { ...input, ...list }, many(reply)),
        update: put(base, { ...input, ...edit }, item, client),
        reply: post(`${base}/reply`, { ...input, ...writing }, reply, client),
        ...engage(base, input, verbs),
        report: post(`${base}/report`, { ...input, ...complaint }, report, client),
        ...trash(route, input),
    };

}

export const comments = feature({ touches: ["reviews"] }, discussion("/comments", "commentId", comment, editing));
const { list: _, ...threads } = discussion("/replies", "replyId", reply, editing);

export const replies = feature({ touches: ["comments", "reviews", "orders", "products"] }, threads);

export default feature({ touches: ["orders", "products"] }, discussion("/reviews", "reviewId", review, reviewInput));
