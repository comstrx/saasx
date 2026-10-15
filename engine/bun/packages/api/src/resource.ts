import { flag, optionalText as text, z } from "engine/validate";

export const resourceShapes = {
    content: z.object({
        name: z.string().min(1),
        tagline: text,
        description: text,
        copyright: text,
        url: text,
        logo: text,
        logo_dark: text,
        icon: text,
        email: text,
        phone: text,
        address: text,
        links: z.array(z.object({ label: z.string(), href: z.string() })).default([]),
        socials: z.array(z.object({ name: z.string(), href: z.string() })).default([]),
        seo: z
            .object({
                title: text,
                description: text,
                keywords: z.array(z.string()).default([]),
                image: text,
                twitter: text,
                robots: z
                    .object({ allow: z.array(z.string()).default([]), disallow: z.array(z.string()).default([]) })
                    .prefault({}),
                sitemap: z.array(z.string()).default([]),
                verification: z.record(z.string(), z.string()).default({}),
            })
            .prefault({}),
    }),
    settings: z.object({
        language: z.string(),
        languages: z.array(z.string()),
        currency: z.string(),
        currencies: z.array(z.string()),
        theme: z.string(),
        themes: z.array(z.string()),
        maintenance: flag,
        maintenance_message: text,
    }),
};

export type Resource = keyof typeof resourceShapes;
export type Resources = { [R in Resource]: z.output<(typeof resourceShapes)[R]> };

export function parseResource ( resource: Resource, value: unknown ): Resources[Resource] {

    return resourceShapes[resource].parse(value);

}
