"use client";

import Heading from "@/elements/heading";
import Link from "@/elements/link";
import Rail from "@/elements/rail";
import Reveal from "@/elements/reveal";
import Stack from "@/elements/stack";
import Text from "@/elements/text";
import type { ProductCardData } from "@/hooks/use-product-card";
import { useProductFavorites } from "@/hooks/use-product-favorites";
import { useTranslations } from "@/lib/providers/intl";
import FavoriteButton from "./favorite-button";
import ProductCard from "./product-card";

type Props = {
    title: string;
    description?: string;
    action?: { href: string; label: string };
    items: readonly { card: ProductCardData; currencyLabel: string }[];
};

export default function ProductRail ({ title, description, action, items }: Props) {

    const t = useTranslations("common");
    const favorites = useProductFavorites(items.map(( item ) => item.card.id));

    return (

        <Reveal>

            <Rail
                label={title}
                previous={t("previous")}
                next={t("next")}
                heading={

                    <Stack gap={1}>

                        <Heading level={2}>{title}</Heading>

                        {description ? <Text tone="muted">{description}</Text> : null}

                    </Stack>

                }
                action={action ? <Link href={action.href} variant="outlined" size="small">{action.label}</Link> : null}
            >

                {items.map(( item ) => (

                    <ProductCard
                        key={item.card.key}
                        {...item}
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

            </Rail>

        </Reveal>

    );

}
