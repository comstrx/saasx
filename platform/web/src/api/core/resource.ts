import { z } from "../../lib/providers/schema.ts";
import { isTimeZone } from "../../lib/std/locale.ts";
import { isHref, webUrl } from "../../lib/std/url.ts";
import { currency } from "./fields.ts";

export const resourceKeys = ["content", "settings", "seo", "policy"] as const;

export type Resource = typeof resourceKeys[number];

const text = z.string().max(10000).default("");
const nullableText = z.string().max(10000).nullable().default(null);
const href = z.string().max(2048).refine(isHref);
const image = z.string().max(2048).refine(( value ) => webUrl(value) !== undefined);
const nullableImage = image.nullable().default(null);
const size = z.number().int().positive().max(10000).nullable().default(null);
const pixels = z.number().int().positive().max(65535).nullable().default(null);
const link = z.object({ label: text, href, external: z.boolean().default(false) });
const links = z.array(link).max(100).default(() => []);
const handle = z.string().min(1).max(50);
const theme = z.enum(["light", "dark", "system"]);
const locale = z.string().regex(/^[a-z]{2,3}(?:-[A-Za-z0-9]{2,8})*$/);
const timeZone = z.string().max(100).refine(isTimeZone);
const date = z.iso.datetime({ offset: true }).nullable().default(null);
const nullableBoolean = z.boolean().nullable().default(null);
const preview = z.number().int().min(-1).nullable().default(null);
const socialImage = z.object({ url: image, alt: text, width: size, height: size });
const socialImages = z.array(socialImage).max(10).default(() => []);
const author = z.object({ name: z.string().min(1).max(200), url: href.nullable().default(null) });
const local = z.string().regex(/^\/(?!\/)[^?#\\]*$/);
const mebibyte = 1024 * 1024;
const bytes = z.number().int().positive().max(1024 * mebibyte);
const quota = z.number().int().positive().max(100000);
const extension = z.string().regex(/^[a-z0-9]{1,10}$/);
const uploadPolicy = z.object({ max_bytes: bytes, max_count: quota });

export const resourceShapes = {
    content: z.strictObject({
        name: text,
        tagline: text,
        description: text,
        url: href.nullable().default(null),
        logo: nullableImage,
        logo_dark: nullableImage,
        logo_alt: text,
        logo_width: size,
        logo_height: size,
        icon: nullableImage,
        apple_icon: nullableImage,
        header_notice: text,
        header_links: links,
        copyright: text,
        links,
        link_groups: z.array(z.object({ title: text, links })).max(20).default(() => []),
        email: z.email().nullable().default(null),
        phone: nullableText,
        whatsapp: nullableText,
        address_line1: text,
        address_line2: text,
        city: text,
        region: text,
        country: text,
        country_code: text,
        postal_code: text,
        map_url: href.nullable().default(null),
        hours: z.array(z.string().max(200)).max(14).default(() => []),
        social_links: links,
        socials: z.array(z.object({ key: handle, url: href })).max(50).catch(() => []).default(() => []),
        contacts: z.array(z.object({ key: handle, value: z.string().min(1).max(500) })).max(50).catch(() => []).default(() => []),
        page_title: text,
        page_description: text,
        page_body: z.string().max(100000).default(""),
        seo: z.object({
            indexable: nullableBoolean,
            image: nullableImage,
            twitter_site: nullableText,
            verification: z.object({ google: nullableText, bing: nullableText, yandex: nullableText }).prefault({}),
        }).prefault({}),
    }),
    settings: z.strictObject({
        language: locale.default("en"),
        languages: z.array(locale).min(1).max(30).default(() => ["en"]),
        time_zone: timeZone.default("UTC"),
        currency: currency.default("USD"),
        currencies: z.array(currency).min(1).max(100).default(() => ["USD"]),
        theme: theme.default("system"),
        themes: z.array(theme).min(1).max(3).default(() => [...theme.options]),
        preferred_language: locale.nullable().default(null),
        preferred_currency: currency.nullable().default(null),
        preferred_theme: theme.nullable().default(null),
        preferred_time_zone: timeZone.nullable().default(null),
        motion: z.enum(["system", "reduced"]).default("system"),
        density: z.enum(["comfortable", "compact"]).default("comfortable"),
        maintenance: z.boolean().default(false),
        maintenance_message: text,
    }),
    seo: z.strictObject({
        title: nullableText,
        description: nullableText,
        keywords: z.array(z.string().max(100)).max(30).nullable().default(null),
        canonical: local.nullable().default(null),
        indexable: nullableBoolean,
        follow: nullableBoolean,
        image: nullableImage,
        image_alt: nullableText,
        image_width: pixels,
        image_height: pixels,
        locales: z.array(locale).max(30).nullable().default(null),
        author: nullableText,
        authors: z.array(author).max(20).default(() => []),
        creator: nullableText,
        publisher: nullableText,
        category: nullableText,
        published_at: date,
        modified_at: date,
        noarchive: nullableBoolean,
        nosnippet: nullableBoolean,
        noimageindex: nullableBoolean,
        notranslate: nullableBoolean,
        max_snippet: preview,
        max_video_preview: preview,
        max_image_preview: z.enum(["none", "standard", "large"]).nullable().default(null),
        unavailable_after: date,
        alternates: z.array(z.object({ language: locale.or(z.literal("x-default")), href: image })).max(30).default(() => []),
        og_type: z.enum(["website", "article"]).nullable().default(null),
        og_title: nullableText,
        og_description: nullableText,
        og_site_name: nullableText,
        og_locale: nullableText,
        og_images: socialImages,
        twitter_card: z.enum(["summary", "summary_large_image"]).nullable().default(null),
        twitter_site: nullableText,
        twitter_creator: nullableText,
        twitter_title: nullableText,
        twitter_description: nullableText,
        twitter_images: socialImages,
        article_section: nullableText,
        article_tags: z.array(z.string().max(100)).max(30).default(() => []),
        verification_google: nullableText,
        verification_bing: nullableText,
        verification_yandex: nullableText,
        structured_data: z.boolean().default(true),
        structured_type: z.enum(["WebPage", "AboutPage", "ContactPage", "ProfilePage", "BlogPosting"]).nullable().default(null),
        breadcrumbs: z.array(z.object({ name: z.string().min(1).max(200), path: local })).max(20).default(() => []),
    }),
    policy: z.strictObject({
        socket_scheme: z.enum(["http", "https"]).nullable().default(null),
        socket_host: z.string().regex(/^[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?$/).nullable().default(null),
        socket_port: z.number().int().min(1).max(65535).nullable().default(null),
        socket_key: z.string().min(1).max(200).nullable().default(null),
        upload_max_bytes: bytes.default(2 * mebibyte),
        upload_max_count: quota.default(20),
        request_max_bytes: bytes.default(8 * mebibyte),
        upload_policies: z.record(z.string().regex(/^[a-z_]{1,40}$/), uploadPolicy).default(() => ({})),
        blocked_extensions: z.array(extension).max(200).default(() => []),
        identity_mime_types: z.array(extension).max(50).default(() => []),
        bulk_max_ids: quota.default(100),
        availability_horizon_days: quota.default(31),
        availability_ahead_days: quota.default(730),
        password_min: z.number().int().min(1).max(256).default(6),
        password_max: z.number().int().min(1).max(4096).default(255),
        password_lower: z.boolean().default(true),
        password_upper: z.boolean().default(true),
        password_digit: z.boolean().default(true),
        password_symbol: z.boolean().default(true),
    }),
};

export type ResourceData<R extends Resource> = z.infer<typeof resourceShapes[R]>;
export type ResourceValues = { [R in Resource]?: Partial<ResourceData<R>> };

export function resourceDefaults<R extends Resource> ( resource: R ): ResourceData<R> {

    return resourceShapes[resource].parse({}) as ResourceData<R>;

}
export function parseResource<R extends Resource> ( resource: R, value: unknown ): ResourceData<R> {

    return resourceShapes[resource].parse(value) as ResourceData<R>;

}
