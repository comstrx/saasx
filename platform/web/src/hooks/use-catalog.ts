import type { EntityKind } from "@/api/features";
import { entityPage, entityPath } from "@/lib/seo/source";
import { routing } from "@/lib/spec/config";
import type { Locale } from "@/lib/spec/languages";
import { placements, screenAt, text } from "@/lib/spec/server";
import { localePath } from "@/lib/std/locale";

type Item = { id: number; slug?: string | null; type?: string | null };

const vocabulary: Readonly<Record<string, string>> = {
    clock: "clock",
    passport: "id-card",
    wifi: "wifi",
    wallet: "wallet",
    luggage: "luggage",
    calendar: "calendar",
    ban: "ban",
    ticket: "ticket",
    location: "pin",
    family: "family",
    ac: "snow",
    shield: "shield",
    seat: "seat",
    parking: "parking",
    language: "translate",
    guide: "guide",
    door: "door",
    camera: "camera",
    bus: "bus",
    washer: "washer",
    truck: "truck",
    tick: "check",
    taxi: "taxi",
    tag: "tag",
    star: "star",
    plane: "airplane",
    phone: "phone",
    paw: "paw",
    kitchen: "kitchen",
    gift: "gift",
    cloud: "cloud",
    car: "car",
    breakfast: "coffee",
    box: "package",
    bed: "bed",
    bath: "bath",
    badge: "seal",
    area: "area",
};

export function verticals () {

    return placements("products")
        .filter(( entry ) => (entry.options.view === "listing" || entry.options.view === "faceted") && Boolean(entry.options.type));

}
export function catalogScreen ( type: string | null | undefined ) {

    if ( !type ) return undefined;

    return verticals().find(( entry ) => entry.options.type === type)?.screen;

}
export function screenArt ( names: readonly (string | undefined)[], fallback: string ): string {

    const art = names.map(( name ) => placements("header").find(( entry ) => entry.screen.name === name)?.options.art)
        .find(( value ): value is string => typeof value === "string" && value.length > 0);

    return `/assets/images/brand/${art ?? fallback}.webp`;

}
export function screenHref ( screen: { path: string } | undefined, locale: string ): string | null {

    return screen ? localePath(locale, screen.path, routing) : null;

}
export function entityHref ( kind: EntityKind, item: Item, locale: string ): string | null {

    const screen = entityPage(kind, item.type);

    return screen ? localePath(locale, entityPath(screen, item), routing) : null;

}
export function directoryOf ( path: string, locale: Locale ): { label: string; href: string }[] {

    const segments = path.split("/").filter(Boolean).slice(0, -1);
    const directory = segments.length ? screenAt(segments) : undefined;

    return directory && !directory.pattern.includes(":")
        ? [{ label: text(directory.title, locale), href: localePath(locale, directory.path, routing) }] : [];

}
export function sectionId ( id: string | undefined, fallback: string ): string {

    return (id ?? fallback).replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-|-$/g, "");

}
export function serverIcon ( key: string | null | undefined ): string {

    return (key && vocabulary[key]) || "check";

}
export function signInHref ( locale: string ): string | null {

    return screenAt(["login"]) ? localePath(locale, "/login", routing) : null;

}
