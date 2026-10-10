import type { Entity } from "@/api/features";
import { serverIcon } from "@/hooks/use-catalog";
import { day } from "@/lib/std/format";
import type { Point } from "@/lib/std/geo";

type Product = Entity<"product">;
type Trait = NonNullable<Product["rules"]>[number];

function flat ( value: Product["features"] ): Trait[] {

    return !value ? [] : Array.isArray(value) ? value : Object.values(value).flatMap(( rows ) => rows ?? []);

}
export function productPictures ( product: Product ) {

    const lead = product.image ? [{ url: product.image, variants: product.image_variants, alt: product.image_alt ?? "" }] : [];
    const rest = (product.attachments ?? []).flatMap(( file ) => file.type === "image" && file.url
        ? [{ url: file.url, variants: file.variants, alt: "" }] : []);
    const seen = new Set<string>();

    return [...lead, ...rest].filter(( picture ) => {

        if ( seen.has(picture.url) ) return false;

        seen.add(picture.url);
        return true;

    }).map(( picture ) => ({
        src: picture.url,
        alt: picture.alt,
        variants: picture.variants ?? null,
        srcSet: Object.entries(picture.variants ?? {})
            .filter(( [key, value] ) => /^\d+$/.test(key) && value)
            .map(( [width, url] ) => `${url} ${width}w`).join(", ") || undefined,
    }));

}
export function productFacts ( values: Product["features"], amenities = false ) {

    return flat(values).sort(( a, b ) => Number(a.sort ?? 0) - Number(b.sort ?? 0)).flatMap(( row, index ) => {

        if ( !row.label ) return [];

        return [{
            key: String(row.id ?? row.key ?? index),
            term: row.label,
            detail: amenities ? undefined : String(row.value_label ?? row.value ?? ""),
            icon: row.included === false ? "ban" : serverIcon(row.icon),
        }];

    });

}
export function productAmenities ( values: Product["features"] ) {

    return flat(values).filter(( row ) => row.type === "bool" && row.included !== false && row.label)
        .sort(( a, b ) => Number(a.sort ?? 0) - Number(b.sort ?? 0))
        .map(( row, index ) => ({ key: String(row.id ?? row.key ?? index), term: row.label ?? "", icon: serverIcon(row.icon) }));

}
export function localClock ( time: string | null | undefined, locale: string ): string | null {

    if ( !time || !/^\d{2}:\d{2}/.test(time) ) return null;

    return day(`1970-01-01T${time.slice(0, 5)}:00Z`, locale, {
        hour: "numeric", minute: "2-digit", timeZone: "UTC",
    });

}
export function validDay ( value: string | null | undefined, locale: string ): string | null {

    return value && Number.isFinite(Date.parse(value)) ? day(value, locale, { day: "numeric", month: "long", year: "numeric" }) : null;

}

export type Family = "lodge" | "room" | "stay" | "experience" | "event" | "ticket" | "transport" | "service" | "document" | "insurance"
    | "goods";

export function familyOf ( abilities: ReadonlySet<string>, type: string | null | undefined ): Family {

    if ( abilities.has("purchasable") ) return "goods";
    if ( abilities.has("lodging") && abilities.has("has_parent") ) return "room";
    if ( abilities.has("lodging") && abilities.has("has_children") ) return "lodge";
    if ( abilities.has("lodging") ) return "stay";
    if ( abilities.has("transport") ) return "transport";
    if ( abilities.has("appointable") ) return "service";
    if ( abilities.has("processable") ) return type === "insurance" ? "insurance" : "document";
    if ( type === "event" || type === "ticket" ) return type;

    return "experience";

}
export function detailGroups ( details: Product["details"] ) {

    if ( !details || Array.isArray(details) ) return [];

    return Object.entries(details).flatMap(( [key, rows] ) => {

        const items = (rows ?? []).flatMap(( row, index ) => row.label ? [{
            key: String(row.id ?? row.key ?? index),
            term: row.label,
            detail: String(row.value_label ?? row.value ?? ""),
            icon: serverIcon(row.icon),
        }] : []);

        return items.length ? [{ key, items }] : [];

    });

}
export function mapLink ( point: Point | null ): string | null {

    return point ? `https://www.google.com/maps/search/?api=1&query=${point.latitude},${point.longitude}` : null;

}
