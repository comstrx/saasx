import type { Page } from "@/api/client";

export type Shelf<T> = {
    items: readonly T[];
    page: number;
    pages: number;
    total: number;
};

export const shelve = <R, T>( data: Page<readonly R[]>, map: ( rows: readonly R[] ) => readonly T[] ): Shelf<T> =>
    ({ items: map(data.rows), page: data.page, pages: data.pages, total: data.total });
