import type { SiteConfig } from "../../../src/lib/spec/surface.ts";

export default {
    name: "Catalogue",
    tagline: null,
    description: null,
    copyright: null,
    url: "http://127.0.0.1:3000",
    logo: null,
    logo_dark: null,
    icon: null,
    email: null,
    phone: null,
    address: null,
    links: [],
    socials: [],
    seo: {
        title: null,
        description: null,
        keywords: [],
        image: null,
        twitter: null,
        robots: { allow: ["/"], disallow: [] },
        sitemap: [],
        verification: {},
    },
} satisfies SiteConfig["contents"];
