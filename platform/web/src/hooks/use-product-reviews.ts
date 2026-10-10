"use client";

import type { Data } from "@/api/features";
import { useRead } from "@/hooks/use-operation";

export function useProductReviews ( productId: number, page: number, initial?: Data<"products", "reviews">[] ) {

    const request = useRead("products", "reviews", { productId, page, limit: 6 }, { initial });

    return { ...request, items: request.data ?? [] };

}
