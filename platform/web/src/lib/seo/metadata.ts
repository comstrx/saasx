import "server-only";

import type { Metadata } from "next";
import { languages } from "@/lib/spec/languages";
import { present } from "@/lib/std/object";
import { type Fields, images } from "./fields";

export function toMetadata ( fields: Fields ): Metadata {

    const { site, title, titled, description, authors, alternates } = fields;
    const data = present(fields.data);
    const seo = present(site.content.seo);
    const verified = present(site.content.seo.verification);
    const bing = verified.bing ?? data.verification_bing;
    const name = site.content.name || undefined;
    const heading = name ? `${title} | ${name}` : title;

    return {
        title: titled ? heading : name ?? title,
        description,
        keywords: fields.keywords,
        authors,
        creator: data.creator,
        publisher: data.publisher,
        category: data.category,
        verification: {
            google: verified.google ?? data.verification_google,
            yandex: verified.yandex ?? data.verification_yandex,
            ...(bing ? { other: { "msvalidate.01": bing } } : {}),
        },
        alternates: {
            canonical: fields.url,
            ...(Object.keys(alternates).length ? { languages: alternates } : {}),
        },
        robots: {
            index: fields.indexable,
            follow: fields.follow,
            noarchive: data.noarchive,
            nosnippet: data.nosnippet,
            noimageindex: data.noimageindex,
            notranslate: data.notranslate,
            "max-snippet": data.max_snippet,
            "max-video-preview": data.max_video_preview,
            "max-image-preview": data.max_image_preview,
            unavailable_after: data.unavailable_after,
        },
        openGraph: {
            type: fields.article ? "article" : "website",
            title: data.og_title ?? title,
            description: data.og_description ?? description,
            url: fields.url,
            siteName: data.og_site_name ?? name,
            images: fields.images,
            locale: data.og_locale ?? languages[fields.locale].openGraph,
            alternateLocale: fields.locales.filter(( locale ) => locale !== fields.locale).map(( locale ) => languages[locale].openGraph),
            ...(fields.article ? {
                publishedTime: fields.publishedAt,
                modifiedTime: fields.modifiedAt,
                authors: authors?.map(( value ) => value.name),
                section: data.article_section,
                tags: fields.data.article_tags,
            } : {}),
        },
        twitter: {
            card: fields.card,
            site: seo.twitter_site ?? data.twitter_site,
            creator: data.twitter_creator,
            title: data.twitter_title ?? title,
            description: data.twitter_description ?? description,
            images: fields.data.twitter_images.length ? images(fields.data.twitter_images) : fields.images,
        },
    };

}
