import type { Data } from "@/api/features";
import { getLocale, getTranslations } from "@/lib/providers/intl-server";
import { routing } from "@/lib/spec/config";
import { type Locale, languages } from "@/lib/spec/languages";
import { screens } from "@/lib/spec/server";
import { count, day, decimal, type Money, money, percent } from "@/lib/std/format";
import { localePath } from "@/lib/std/locale";

export type ProductCardData = {
    key: string;
    id: number;
    signIn: string | null;
    href: string | null;
    title: string;
    image: string | null;
    variants: Product["image_variants"];
    alt: string;
    badge: string | null;
    place: string | null;
    facts: Fact[];
    rating: { value: string; count: string; label: string } | null;
    price: { from: string; now: Money; was: Money | null; unit: string | null } | null;
    gallery: { src: string; variants: Product["image_variants"] }[];
    perk: string | null;
    tag: string | null;
    slides: { previous: string; next: string };
};

type Product = Data<"products", "list">;
type Price = Product["min_price"];
type Labels = {
    signIn: string | null;
    from: string;
    unit: ( unit: string ) => string;
    days: ( count: number ) => string;
    hours: ( count: number ) => string;
    minutes: ( count: number ) => string;
    rating: ( rating: string, count: number ) => string;
    off: ( rate: string ) => string;
    shipping: string;
    digital: string;
    freeCancel: string;
    payLater: string;
    popular: string;
    slides: { previous: string; next: string };
};
type Context = { locale: Locale; href: string | null; badges: boolean; labels: Labels; popular?: number };
type Fact = { icon: string; text: string };

export const productFields = [
    "id", "name", "slug", "type", "image", "image_variants", "image_alt", "currency", "min_price", "sale_price", "offer",
    "price_context", "rating", "reviews", "geo", "capabilities", "starts_at", "duration", "duration_unit", "digital",
    "origin", "destination", "in_favorites", "orders", "allow_pay_later", "attachments", "url", "variants", "kind", "policies",
    "refundable", "free_before_hours",
];

const galleryLimit = 5;

function amount ( price: Price ): number {

    if ( price === null || price === undefined ) return Number.NaN;
    if ( typeof price !== "object" ) return Number(price);

    return Number((price.display?.amount != null ? price.display : price).amount);

}
function span ( row: Product, labels: Labels ): string | undefined {

    const length = Number(row.duration);

    if ( !Number.isFinite(length) || length <= 0 ) return undefined;
    if ( row.duration_unit === "day" ) return labels.days(length);
    if ( row.duration_unit === "hour" ) return labels.hours(length);
    if ( row.duration_unit === "minute" ) return labels.minutes(length);

    return undefined;

}
function route ( row: Product ): string | undefined {

    const from = row.origin?.geo?.name ?? row.origin?.city?.name;
    const to = row.destination?.geo?.name ?? row.destination?.city?.name;

    return from && to ? `${from} – ${to}` : undefined;

}
function facts ( row: Product, abilities: ReadonlySet<string>, { locale, labels }: Context ): Fact[] {

    const path = abilities.has("transport") ? route(row) : undefined;
    const length = abilities.has("schedulable") && !abilities.has("transport") ? span(row, labels) : undefined;
    const delivery = row.digital ? labels.digital : labels.shipping;
    const list: (Fact | undefined)[] = [
        path ? { icon: "pin", text: path } : undefined,
        row.starts_at ? { icon: "calendar", text: day(row.starts_at, locale, { day: "numeric", month: "short" }) } : undefined,
        length ? { icon: "clock", text: length } : undefined,
        abilities.has("deliverable") ? { icon: row.digital ? "lightning" : "bag", text: delivery } : undefined,
    ];

    return list.filter(( fact ) => fact !== undefined).slice(0, 2);

}
function gallery ( row: Product ): ProductCardData["gallery"] {

    const images = (row.attachments ?? []).filter(( item ) => item.type === "image" && item.url)
        .map(( item ) => ({ src: item.url ?? "", variants: item.variants }));
    const cover = row.image ? [{ src: row.image, variants: row.image_variants }] : [];

    return [...cover, ...images.filter(( item ) => item.src !== row.image)].slice(0, galleryLimit);

}
export function perks ( row: Product, labels: Pick<Labels, "freeCancel" | "payLater"> ): string[] {

    const free = (row.policies ?? [])
        .some(( policy ) => policy.type === "cancellation" && policy.refundable && (policy.free_before_hours ?? 0) > 0);

    return [free ? labels.freeCancel : null, row.allow_pay_later ? labels.payLater : null].filter(( value ) => value !== null);

}
export function popularity ( rows: readonly Product[] ): number | undefined {

    const orders = rows.map(( row ) => row.orders ?? 0).sort(( a, b ) => b - a);
    const middle = orders[Math.floor(orders.length / 2)] ?? 0;
    const third = orders[Math.min(2, orders.length - 1)] ?? 0;

    return third > middle ? third : undefined;

}
export function productCard ( row: Product, context: Context ): ProductCardData {

    const { locale, labels, href, badges } = context;
    const abilities = new Set(row.capabilities ?? []);
    const fallback = row.currency ?? undefined;
    const base = money(row.min_price, locale, fallback);
    const sale = money(row.sale_price, locale, fallback);
    const reduced = Boolean(row.offer) && amount(row.sale_price) < amount(row.min_price);
    const rate = percent(row.offer?.rate, locale);
    const score = decimal(row.rating, locale);
    const reviews = row.reviews ?? 0;
    const place = abilities.has("transport") ? [] : [row.geo?.city?.name, row.geo?.country?.name].filter(( part ) => part);
    const unit = labels.unit(row.price_context?.unit ?? "");
    const now = reduced ? sale : base;

    return {
        key: String(row.id),
        id: row.id,
        signIn: labels.signIn,
        href,
        title: row.name,
        image: row.image ?? null,
        variants: row.image_variants,
        alt: row.image_alt ?? "",
        badge: badges && reduced && rate ? labels.off(rate) : null,
        place: place.length ? place.join(languages[locale].comma) : null,
        facts: facts(row, abilities, context),
        rating: score && reviews > 0 ? { value: score, count: count(reviews, locale), label: labels.rating(score, reviews) } : null,
        price: now ? { from: labels.from, now, was: reduced ? base ?? null : null, unit: unit || null } : null,
        gallery: gallery(row),
        perk: perks(row, labels)[0] ?? null,
        tag: context.popular && (row.orders ?? 0) >= context.popular ? labels.popular : null,
        slides: labels.slides,
    };

}
export async function productLabels () {

    const [t, locale] = await Promise.all([getTranslations("product"), getLocale()]);
    const currencies = new Intl.DisplayNames([locale], { type: "currency" });
    const login = screens.find(( screen ) => screen.name === "login");
    const card: Labels = {
        signIn: login ? localePath(locale, login.path, routing) : null,
        from: t("from"),
        unit: ( unit ) => t("unit", { unit }),
        days: ( count ) => t("days", { count }),
        hours: ( count ) => t("hours", { count }),
        minutes: ( count ) => t("minutes", { count }),
        rating: ( rating, count ) => t("rating", { rating, count }),
        off: ( rate ) => t("off", { rate }),
        shipping: t("shipping"),
        digital: t("digital"),
        freeCancel: t("freeCancel"),
        payLater: t("payLater"),
        popular: t("popular"),
        slides: { previous: t("photoPrevious"), next: t("photoNext") },
    };

    const view = { was: t("was"), now: t("now"), currency: ( code: string ) => currencies.of(code) ?? code };

    return { locale: locale as Locale, card, view };

}
