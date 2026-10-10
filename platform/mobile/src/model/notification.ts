import { picture } from "@/api/client";
import { oneOf } from "@/api/contracts";
import type { AlertCounts, AlertPage, AlertRow } from "@/api/endpoints/notifications";
import type { Picture } from "@/model/catalog";
import { type Shelf, shelve } from "@/model/shelf";

export type Alert = {
    id: number;
    kind: string;
    type: string;
    channel: string;
    title: string;
    body: string;
    image: Picture | null;
    read: boolean;
    pinned: boolean;
    at: string | null;
};

const readable = ( alert: Alert ): boolean => Boolean(alert.title || alert.body);

export const alertFamily = ( kind: string ): string => kind.split("_")[0] ?? "";

type Alerts = {
    count: number;
    unread: number;
    pinned: number;
};

type AlertKinds = Readonly<Record<string, number>>;

type AlertBoard = Shelf<Alert> & {
    kinds: AlertKinds;
};

type AlertGroup = {
    family: string;
    kinds: readonly string[];
    count: number;
};

const shelved = new Set([ "" ]);

export const alertGroups = ( kinds: AlertKinds ): readonly AlertGroup[] => {

    const families = new Map<string, AlertGroup>();

    for ( const [ kind, count ] of Object.entries(kinds) ) {

        if ( shelved.has(kind) || count <= 0 ) continue;

        const family = alertFamily(kind);
        const held = families.get(family) ?? { family, kinds: [], count: 0 };

        families.set(family, { family, kinds: [ ...held.kinds, kind ], count: held.count + count });

    }

    return [ ...families.values() ].sort(( first, second ) => second.count - first.count );

};

export type AlertTone = "brand" | "success" | "warning" | "danger" | "info" | "neutral";

const tones: Record<string, AlertTone> = {
    order_paid: "success",
    order_confirmed: "success",
    order_completed: "success",
    order_cancelled: "danger",
    order_refunded: "info",
    order_provider_booked: "info",
    wallet_deposit: "success",
    wallet_withdraw: "warning",
    wallet_withdraw_alert: "warning",
    wallet_transfer: "info",
    ticket_closed: "success",
    ticket_resolved: "success",
    identity_approved: "success",
    identity_rejected: "danger",
    report_filed: "danger",
    level_up: "warning",
};

const families: Record<string, AlertTone> = {
    order: "brand",
    wallet: "info",
    payment: "success",
    transaction: "info",
    refund: "info",
    auth: "warning",
    identity: "warning",
    session: "warning",
    ticket: "info",
    report: "danger",
    level: "brand",
    referral: "brand",
    review: "warning",
    chat: "info",
    message: "info",
    room: "info",
    offer: "danger",
    coupon: "danger",
};

export const alertTone = ( kind: string ): AlertTone =>
    tones[kind] ?? families[alertFamily(kind)] ?? "neutral";

const alertOf = ( entry: AlertRow ): Alert => ({
    id: entry.id,
    kind: entry.kind ?? "system",
    type: entry.type ?? "",
    channel: entry.channel ?? "",
    title: entry.title ?? "",
    body: entry.content ?? "",
    image: picture(entry.image, oneOf(entry.image_variants) ?? undefined),
    read: Boolean(entry.read),
    pinned: Boolean(entry.pinned),
    at: entry.send_at ?? entry.created_at ?? null,
});

export const boardOf = ( page: AlertPage ): AlertBoard => ({
    ...shelve(page, ( rows ) => rows.map(alertOf).filter(readable)),
    kinds: page.kinds,
});

export const alertsOf = ( data: AlertCounts ): Alerts => ({
    count: data.count ?? 0,
    unread: data.unread ?? 0,
    pinned: data.pinned ?? 0,
});
