import brand from "../../brand.json";

type BrandWords = {
    name: string;
    title: string;
    home: string;
};

export const identity = {
    name: brand.name,
    title: brand.title,
    scheme: brand.scheme,
    site: brand.site,
    iso: brand.iso,
    since: brand.since,
} as const;

const words = brand.words as Readonly<Record<string, BrandWords>>;

export const wordsFor = ( locale: string ): BrandWords => words[locale] ?? words.en ?? { name: identity.name, title: identity.title, home: "" };
