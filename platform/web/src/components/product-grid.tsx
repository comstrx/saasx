"use client";

import Grid from "@/elements/grid";
import type { ProductCardData } from "@/hooks/use-product-card";
import { useProductFavorites } from "@/hooks/use-product-favorites";
import FavoriteButton from "./favorite-button";
import ProductCard from "./product-card";

type Props = { items: readonly { card: ProductCardData; currencyLabel: string }[]; label?: string; columns?: 3 | 4 };

export default function ProductGrid ({ items, label, columns = 4 }: Props) {

    const favorites = useProductFavorites(items.map(( item ) => item.card.id));

    return (

        <Grid label={label} columns={columns} gap={5}>

            {items.map(( item, index ) => (

                <ProductCard
                    key={item.card.key}
                    {...item}
                    priority={index < 4}
                    actions={

                        <FavoriteButton
                            key={favorites.identity}
                            productId={item.card.id}
                            name={item.card.title}
                            state={favorites.state(item.card.id)}
                            signIn={item.card.signIn}
                            compact
                            tone="photo"
                        />

                    }
                />

            ))}

        </Grid>

    );

}
