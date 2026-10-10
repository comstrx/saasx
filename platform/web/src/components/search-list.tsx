"use client";

import type { ComponentProps } from "react";
import Grid from "@/elements/grid";
import Stack from "@/elements/stack";
import { useProductFavorites } from "@/hooks/use-product-favorites";
import FavoriteButton from "./favorite-button";
import ProductCard from "./product-card";
import SearchCard from "./search-card";

type Item = Omit<ComponentProps<typeof SearchCard>, "details" | "actions" | "priority">;
type Props = { items: readonly Item[]; view: "list" | "grid"; label: string; details: string };

export default function SearchList ({ items, view, label, details }: Props) {

    const favorites = useProductFavorites(items.map(( item ) => item.card.id));
    const heart = ( item: Item ) => (

        <FavoriteButton
            key={favorites.identity}
            productId={item.card.id}
            name={item.card.title}
            state={favorites.state(item.card.id)}
            signIn={item.card.signIn}
            compact
            tone="photo"
        />

    );

    if ( view === "grid" ) return (

        <Grid label={label} columns={3} gap={5}>

            {items.map(( item, index ) => (

                <ProductCard
                    key={item.card.key} card={item.card} currencyLabel={item.currencyLabel} priority={index < 3} actions={heart(item)}
                />

            ))}

        </Grid>

    );

    return (

        <Stack as="ul" gap={4} aria-label={label}>

            {items.map(( item, index ) => (

                <SearchCard key={item.card.key} {...item} details={details} priority={index < 2} actions={heart(item)} />

            ))}

        </Stack>

    );

}
