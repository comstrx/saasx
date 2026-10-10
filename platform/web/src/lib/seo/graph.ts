import "server-only";

import type { ResourceData } from "@/api/core/resource";
import { screens, text } from "@/lib/spec/server";
import { type Json, pruned } from "@/lib/std/json";
import { absoluteHref, parseUrl } from "@/lib/std/url";
import { type Fields, pageUrl, type Site } from "./fields";
import { postalAddress } from "./product";

type Crumb = { name: string; path: string };
type Content = ResourceData<"content">;

function logo ( origin: string, image: string | null ): string | undefined {

    return image ? absoluteHref(origin, image) : undefined;

}
function profiles ( content: Content ): string[] {

    const links = [
        ...content.socials.map(( item ) => item.url),
        ...content.social_links.filter(( item ) => item.external).map(( item ) => item.href),
    ];

    return [...new Set(links.filter(( link ) => parseUrl(link)))];

}
function contact ( content: Content ): Record<string, Json> {

    return pruned({
        email: content.email,
        telephone: content.phone,
        address: postalAddress({
            streetAddress: content.address_line1,
            addressLocality: content.city,
            postalCode: content.postal_code,
            addressCountry: content.country_code,
        }),
    });

}
function organization ( { origin, content }: Site ) {

    const sameAs = profiles(content);

    if ( !content.name ) return null;

    return {
        "@type": "Organization",
        "@id": `${origin}/#organization`,
        url: origin,
        name: content.name,
        ...pruned({ logo: logo(origin, content.logo), sameAs: sameAs.length ? sameAs : null }),
        ...contact(content),
    };

}
function trail ( { data, path, title, locale }: Fields ): Crumb[] {

    if ( data.breadcrumbs.length ) return data.breadcrumbs;
    if ( path === "/" ) return [];

    const segments = path.split("/").filter(Boolean);
    const ancestors = ["/", ...segments.slice(0, -1).map(( _, index ) => `/${segments.slice(0, index + 1).join("/")}`)];
    const known = ancestors.flatMap(( ancestor ) => {

        const page = screens.find(( candidate ) => candidate.path === ancestor);

        return page ? [{ name: text(page.title, locale), path: ancestor }] : [];

    });

    return [...known, { name: title, path }];

}
export function toGraph ( fields: Fields ): Json {

    const { data, site, url, title, description, locale, authors, article, images = [] } = fields;

    if ( !data.structured_data ) return null;

    const owner = organization(site);
    const website = {
        "@type": "WebSite",
        "@id": `${site.origin}/#website`,
        url: site.origin,
        inLanguage: locale,
        ...(site.content.name ? { name: site.content.name } : {}),
        ...(owner ? { publisher: { "@id": owner["@id"] } } : {}),
    };
    const webpage = {
        "@type": data.structured_type ?? (article ? "BlogPosting" : "WebPage"),
        "@id": `${url}#page`,
        url,
        name: title,
        description,
        inLanguage: locale,
        isPartOf: { "@id": `${site.origin}/#website` },
        ...(images.length ? { image: images.map(( image ) => absoluteHref(site.origin, image.url)) } : {}),
        ...(fields.entity ? { mainEntity: fields.entity } : {}),
        ...(article ? {
            headline: title,
            ...(owner ? { publisher: { "@id": owner["@id"] } } : {}),
            ...(fields.publishedAt ? { datePublished: fields.publishedAt } : {}),
            ...(fields.modifiedAt ? { dateModified: fields.modifiedAt } : {}),
            ...(authors ? { author: authors.map(( value ) => ({ "@type": "Person", ...value })) } : {}),
        } : {}),
    };
    const crumbs = trail(fields);
    const breadcrumbs = {
        "@type": "BreadcrumbList",
        itemListElement: crumbs.map(( item, index ) => ({
            "@type": "ListItem",
            position: index + 1,
            name: item.name,
            item: pageUrl(site, locale, item.path),
        })),
    };

    return {
        "@context": "https://schema.org",
        "@graph": [...(owner ? [owner] : []), website, webpage, ...(crumbs.length > 1 ? [breadcrumbs] : [])],
    };

}
