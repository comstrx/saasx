import { picture } from "@/api/client";
import { oneOf } from "@/api/contracts";
import type { CategoryRow } from "@/api/endpoints/categories";
import type { Picture } from "@/std/picture";

export type Category = {
    id: number;
    name: string;
    summary: string;
    image: Picture | null;
    icon: string;
    parent: number | null;
    parentName: string;
    children: number;
    catalogs: number;
    rating: number;
    orders: number;
    reviews: number;
};

export const categoryOf = ( entry: CategoryRow ): Category => ({
    id: entry.id,
    name: entry.name,
    summary: ( entry.description ?? "" ).trim(),
    image: picture(entry.image, oneOf(entry.image_variants)),
    icon: entry.icon ?? "",
    parent: entry.parent?.id ?? null,
    parentName: entry.parent?.name ?? "",
    children: entry.childrens ?? 0,
    catalogs: entry.catalogs ?? 0,
    rating: Number(entry.rating ?? 0),
    orders: entry.orders ?? 0,
    reviews: entry.reviews ?? 0,
});

export type Branch = {
    root: Category;
    children: readonly Category[];
};

const stocked = ( category: Category ): boolean => category.catalogs > 0 || category.children > 0;

export const branching = ( category: Category ): boolean => category.children > 0;

export const branchesOf = ( rows: readonly Category[] ): readonly Branch[] => {

    const kids = new Map<number, Category[]>();

    for ( const row of rows ) {

        if ( row.parent === null ) continue;

        const held = kids.get(row.parent);

        if ( held ) held.push(row);
        else kids.set(row.parent, [ row ]);

    }

    return rows
        .filter(( row ) => row.parent === null )
        .map(( root ) => ({ root, children: kids.get(root.id) ?? [] }) )
        .filter(( branch ) => branch.children.length > 0 || stocked(branch.root) );

};

export const reachOf = ( branch: Branch ): number =>
    branch.root.catalogs + branch.children.reduce(( sum, child ) => sum + child.catalogs, 0);
