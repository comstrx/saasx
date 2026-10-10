import { z } from "../../lib/providers/schema.ts";
import { browse, engage, feature, get, many, post } from "../core/dsl.ts";
import { ack, body, count, flag, id, page, seoFields, text } from "../core/fields.ts";
import { attachment } from "./documents.ts";
import { comment } from "./reviews.ts";

const article = z.object({
    ...seoFields,
    id,
    title: text,
    description: text,
    content: text,
    image: text,
    attachments: z.array(attachment).nullish(),
    created_at: text,
    comments: count,
    views: count,
    likes: count,
    dislikes: count,
    in_favorites: flag,
});
const articleId = { articleId: id };

export default feature({ touches: ["favorites"] }, {
    ...browse("/blogs", articleId, article, { cache: 60 }),
    ...engage("/blogs/{articleId}", articleId, ["like", "dislike", "visit", "report"]),
    comments: get("/blogs/{articleId}/comments", { ...articleId, ...page }, many(comment)),
    comment: post("/blogs/{articleId}/comment", { ...articleId, content: body }, comment, { execution: "client" }),
    favorite: post("/blogs/{articleId}/favorite", articleId, ack, { execution: "client" }),
    unfavorite: post("/blogs/{articleId}/unfavorite", articleId, ack, { execution: "client" }),
});
