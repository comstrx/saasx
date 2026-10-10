"use client";

import { useRead } from "@/hooks/use-operation";

export type ReviewSource = "category" | "vendor" | "poi" | "country" | "region" | "city" | "district";

export function useEntityReviews ( source: ReviewSource, id: number ) {

    const category = useRead("categories", "reviews", { categoryId: id, limit: 6 }, { enabled: source === "category" });
    const vendor = useRead("vendors", "reviews", { vendorId: id, limit: 6 }, { enabled: source === "vendor" });
    const poi = useRead("pois", "reviews", { poiId: id, limit: 6 }, { enabled: source === "poi" });
    const country = useRead("countries", "reviews", { countryId: id, limit: 6 }, { enabled: source === "country" });
    const region = useRead("regions", "reviews", { regionId: id, limit: 6 }, { enabled: source === "region" });
    const city = useRead("cities", "reviews", { cityId: id, limit: 6 }, { enabled: source === "city" });
    const district = useRead("districts", "reviews", { districtId: id, limit: 6 }, { enabled: source === "district" });
    const request = { category, vendor, poi, country, region, city, district }[source];

    return { ...request, items: request.data ?? [] };

}
