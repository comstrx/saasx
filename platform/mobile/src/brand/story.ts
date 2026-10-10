import type { BannerName } from "@/brand/assets";

export type Chapter = {
    key: string;
    banner: BannerName;
};

export const story: readonly Chapter[] = [
    { key: "stay", banner: "story-stay-v3" },
    { key: "travel", banner: "story-travel-v3" },
    { key: "visa", banner: "story-visa-v3" },
    { key: "insure", banner: "story-insure-v3" },
    { key: "product", banner: "story-product-v3" },
];
