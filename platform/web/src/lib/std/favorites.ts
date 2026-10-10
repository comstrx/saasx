import { queryNumber, queryText } from "./listing.ts";

type Related = {
    id: number; name?: string | null; title?: string | null; image?: string | null; slug?: string | null; type?: string | null;
};
type Favorite = {
    related_type?: string | null;
    catalog?: Related | null; blog?: Related | null; geo?: Related | null; category?: Related | null; poi?: Related | null;
};
type Query = Readonly<Record<string, string | string[] | undefined>>;

export const favoriteKinds = ["all", "catalog", "blog", "geo", "category", "poi"] as const;
export const favoriteSorts = ["newest", "oldest"] as const;

export function favoriteInput ( query: Query, limit: number ) {

    const kind = favoriteKinds.find(( value ) => value === queryText(query, "kind")) ?? "all";
    const sort = favoriteSorts.find(( value ) => value === queryText(query, "sort")) ?? "newest";

    return {
        page: queryNumber(query, "page", 1, 10000) ?? 1,
        limit: Math.max(1, Math.min(100, limit)), sort,
        ...(kind !== "all" ? { filters: { related: kind } } : {}),
    };

}
export function favoriteTarget ( row: Favorite ) {

    const kind = favoriteKinds.find(( value ) => value === row.related_type && value !== "all");
    const item = kind === "catalog" ? row.catalog : kind === "blog" ? row.blog : kind === "geo" ? row.geo
        : kind === "category" ? row.category : kind === "poi" ? row.poi : null;

    return { item, kind: kind ?? "all", entity: kind === "catalog" ? "product" : kind === "blog" ? "article" : kind };

}
