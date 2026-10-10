export const reviewAspects = {
    bookable: ["communication", "value", "accuracy"],
    purchasable: ["communication", "value", "accuracy"],
    lodging: ["cleanliness", "location", "check_in"],
    transport: ["vehicle", "punctuality", "driver"],
    appointable: ["expertise", "punctuality"],
    perishable: ["venue", "organization"],
    deliverable: ["quality", "packaging", "delivery"],
    processable: ["processing", "guidance"],
    underwritten: ["clarity", "claims"],
} as const;

export type ReviewAspect = typeof reviewAspects[keyof typeof reviewAspects][number];
type Values = Record<string, string>;
export type FeedbackRecord = {
    rating?: number | string | null; title?: string | null; content?: string | null;
    scores?: Record<string, number | string | null | undefined> | null;
};
type Draft = { rating?: number; title?: string; content?: string; scores?: Record<string, number> };

export function aspectBook ( capabilities: readonly string[] ): ReviewAspect[] {

    const found: ReviewAspect[] = [];

    for ( const name of capabilities ) {

        if ( Object.hasOwn(reviewAspects, name) ) found.push(...reviewAspects[name as keyof typeof reviewAspects]);

    }

    return [...new Set(found)];

}
export function feedbackValues ( draft: Draft = {} ): Values {

    return {
        rating: draft.rating === undefined ? "" : String(draft.rating), title: draft.title ?? "", content: draft.content ?? "",
        ...Object.fromEntries(Object.entries(draft.scores ?? {}).map(( [key, value] ) => [`scores.${key}`, String(value)])),
    };

}
export function feedbackErrors (
    values: Values, aspects: readonly ReviewAspect[], optionalRating = false,
): Record<string, "rating" | "title" | "content"> {

    const errors: Record<string, "rating" | "title" | "content"> = {};
    const rating = Number(values.rating);

    if ( (!optionalRating || values.rating) && (!values.rating || !Number.isInteger(rating) || rating < 1 || rating > 5) ) {

        errors.rating = "rating";

    }

    if ( (values.title?.length ?? 0) > 255 ) errors.title = "title";
    if ( (values.content?.length ?? 0) > 65535 ) errors.content = "content";

    for ( const name of aspects ) {

        const key = `scores.${name}`;
        const value = values[key];

        if ( value && (!Number.isInteger(Number(value)) || Number(value) < 1 || Number(value) > 5) ) errors[key] = "rating";

    }

    return errors;

}
export function feedbackInput ( values: Values, aspects: readonly ReviewAspect[] ) {

    return {
        rating: Number(values.rating),
        ...(values.title?.trim() ? { title: values.title.trim() } : {}),
        ...(values.content?.trim() ? { content: values.content.trim() } : {}),
        scores: Object.fromEntries(aspects.flatMap(( name ) => values[`scores.${name}`] ? [[name, Number(values[`scores.${name}`])]] : [])),
    };

}
export function reviewDraft ( review: FeedbackRecord ): Values {

    return feedbackValues({
        title: review.title ?? "", content: review.content ?? "",
        scores: Object.fromEntries(Object.entries(review.scores ?? {}).flatMap(( [key, value] ) =>
            value == null ? [] : [[key, Number(value)]])),
    });

}
export function reviewPatch ( review: FeedbackRecord, values: Values, aspects: readonly ReviewAspect[] ) {

    const scores = { ...review.scores };
    const changed = aspects.some(( key ) => String(review.scores?.[key] ?? "") !== (values[`scores.${key}`] ?? ""));

    for ( const key of aspects ) {

        if ( values[`scores.${key}`] ) scores[key] = Number(values[`scores.${key}`]);
        else delete scores[key];

    }

    return {
        ...(values.rating ? { rating: Number(values.rating) } : {}),
        ...(values.title !== (review.title ?? "") ? { title: (values.title ?? "").trim() } : {}),
        ...(values.content !== (review.content ?? "") ? { content: (values.content ?? "").trim() } : {}),
        ...(changed ? { scores: Object.fromEntries(Object.entries(scores).flatMap(( [key, value] ) =>
            value == null ? [] : [[key, Number(value)]])) } : {}),
    };

}
