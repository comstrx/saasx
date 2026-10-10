import type { Artwork } from "@/elements/art";
import type { EmblemName } from "@/elements/emblem";
import type { IconName } from "@/elements/icon";

const glyphs: Record<string, IconName> = {
    hotel: "stay",
    room: "stay",
    property: "stay",
    tour: "tour",
    travel: "travel",
    ticket: "ticket",
    visa: "visa",
    product: "product",
    service: "service",
    event: "event",
    insurance: "shield",
};

export const glyphOf = ( type: string ): IconName => glyphs[type] ?? "tour";

const figures: Readonly<Record<string, Artwork>> = {
    hotel: "domain-hotel",
    room: "domain-room",
    property: "domain-property",
    tour: "domain-tour",
    travel: "domain-travel",
    ticket: "domain-ticket",
    visa: "domain-visa",
    product: "domain-product",
    service: "domain-service",
    event: "domain-event",
    insurance: "domain-insurance",
};

export const figureOf = ( type: string ): Artwork => figures[type] ?? "discovery";

const vehicles: Readonly<Record<string, IconName>> = {
    flight: "travel",
    train: "train",
    bus: "bus",
    ferry: "ship",
    car: "car",
};

export const vehicleOf = ( mode: string ): IconName | null => vehicles[mode] ?? null;

const scenes: Record<string, EmblemName> = {
    flash: "flash",
    launch: "rocket",
    clearance: "fire",
    seasonal: "gift",
};

export const sceneOf = ( type: string ): EmblemName => scenes[type] ?? "gift";

const marks: Record<string, IconName> = {
    passport: "passport",
    bus: "bus",
    camera: "camera",
    wallet: "wallet",
    ticket: "ticket",
    clock: "clock",
    shield: "shield",
    location: "location",
    calendar: "calendar",
    users: "users",
    doc: "doc",
    file: "doc",
    check: "docCheck",
};

const hints: readonly ( readonly [ readonly string[], IconName ] )[] = [
    [ [ "wifi", "internet", "network" ], "wifi" ],
    [ [ "park", "garage" ], "parking" ],
    [ [ "breakfast", "coffee", "kitchen", "meal", "dining", "restaurant" ], "breakfast" ],
    [ [ "pool", "swim" ], "pool" ],
    [ [ "bath", "shower", "toilet" ], "bath" ],
    [ [ "bed", "sleep", "linen" ], "bed" ],
    [ [ "smoking" ], "smoking" ],
    [ [ "smoke", "alarm", "detector" ], "smokeDetector" ],
    [ [ "pet", "animal" ], "pets" ],
    [ [ "party", "event" ], "party" ],
    [ [ "baby", "child", "infant", "crib" ], "baby" ],
    [ [ "camera", "surveil", "security" ], "camera" ],
    [ [ "tv", "television", "netflix", "screen" ], "tv" ],
    [ [ "transport", "transfer", "pickup", "shuttle" ], "bus" ],
    [ [ "gym", "fitness", "sport" ], "gym" ],
    [ [ "air", "condition", "heating", "climate" ], "ac" ],
    [ [ "door", "entrance", "lock", "access" ], "door" ],
    [ [ "star", "rating", "class" ], "star" ],
    [ [ "luggage", "bag", "storage" ], "luggage" ],
    [ [ "passport", "visa", "identity" ], "passport" ],
    [ [ "photo", "picture", "image" ], "camera" ],
    [ [ "fund", "money", "fee", "payment" ], "wallet" ],
    [ [ "itinerary", "flight", "booking" ], "ticket" ],
    [ [ "cover", "insur", "protect" ], "shield" ],
    [ [ "guest", "capacity", "occupan", "traveller", "applicant" ], "users" ],
    [ [ "time", "hour", "clock", "check", "duration", "process" ], "clock" ],
    [ [ "view", "balcony", "terrace", "garden", "outdoor" ], "compass" ],
    [ [ "work", "desk", "office" ], "doc" ],
    [ [ "place", "country", "region", "scope", "destination" ], "location" ],
];

const keyed: Readonly<Record<string, IconName>> = {
    ac: "ac",
    area: "compass",
    baggage: "luggage",
    bathrooms: "bath",
    beds: "bed",
    breakfast: "breakfast",
    condition: "gem",
    experience_level: "award",
    guided: "users",
    kitchen: "breakfast",
    languages: "language",
    parking: "parking",
    pickup_included: "bus",
    seat_class: "ticket",
    section: "ticket",
    star_rating: "star",
    washer: "bath",
    wifi: "wifi",
};

export const markOf = ( icon: string | undefined, key: string, fallback: IconName = "check" ): IconName => {

    const exact = keyed[key];

    if ( exact ) return exact;

    const named = icon ? marks[icon] : undefined;

    if ( named ) return named;

    const value = `${ key } ${ icon ?? "" }`.toLowerCase();

    return hints.find(( row ) => row[0].some(( hint ) => value.includes(hint) ) )?.[1] ?? fallback;

};
