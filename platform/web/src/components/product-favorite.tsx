"use client";

import { useProductFavorites } from "@/hooks/use-product-favorites";
import FavoriteButton from "./favorite-button";

type Props = { productId: number; name: string; signIn: string | null; compact?: boolean; tone?: "neutral" | "photo" | "snow" };

export default function ProductFavorite ( props: Props ) {

    const data = useProductFavorites([props.productId]);

    return <FavoriteButton key={data.identity} {...props} state={data.state(props.productId)} />;

}
