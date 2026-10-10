import { media } from "@/api/client";
import { baseCurrency, cashOr, numeric, oneOf } from "@/api/contracts";
import type { ContactKind, LocationBody, NotifyBody, ProfileRow, SettingsRow } from "@/api/endpoints/account";

type Wallet = {
    currency: string;
    total: number;
    available: number;
    pending: number;
    points: number;
};

type Stats = {
    orders: number;
    reviews: number;
    coupons: number;
    referrals: number;
};

type AccountLocation = {
    address: string;
    address2: string;
    zipCode: string;
    city: string;
    country: string;
};

type AccountLocationInput = Pick<AccountLocation, "address" | "address2" | "zipCode">;

export type AccountPreferences = {
    language: string;
    currency: string;
    theme: string;
};

export const preferencesOf = ({ language, currency, theme }: AccountPreferences): AccountPreferences => ({ language, currency, theme });

export const samePreferences = ( left: AccountPreferences, right: AccountPreferences ): boolean =>
    left.language === right.language && left.currency === right.currency && left.theme === right.theme;

type NotifyChannel = {
    key: string;
    on: boolean;
};

export type NotifyTopic = {
    key: string;
    on: boolean;
    forced: boolean;
    channels: readonly NotifyChannel[];
};

export type Settings = {
    theme: string;
    currency: string;
    language: string;
    confirmWay: string;
    topics: readonly NotifyTopic[];
};

export type NotifyPatch = {
    topic: string;
    on?: boolean | undefined;
    channel?: { key: string; on: boolean } | undefined;
};

type Referral = {
    code: string;
    link: string | null;
};

export type Account = {
    id: number;
    name: string;
    email: string | null;
    phone: string | null;
    image: string | null;
    verified: boolean;
    emailVerified: boolean;
    phoneVerified: boolean;
    identity: string | null;
    hasPassword: boolean;
    level: number;
    referral: Referral | null;
    stats: Stats;
    wallet: Wallet | null;
    location: AccountLocation | null;
    preferences: AccountPreferences;
    permissions: readonly string[];
};

export const allows = ( account: Account | undefined, permission: string ): boolean =>
    Boolean(account?.permissions.includes(permission));

export type ContactField = ContactKind;

export type Closure = "deactivate" | "erase";

export type ProfileEdit =
    | { slot: "name"; name: string }
    | { slot: "password"; current: string; next: string }
    | { slot: "phone"; phone: string; password: string }
    | { slot: "email"; email: string; password: string }
    | { slot: "location"; location: AccountLocationInput }
    | { slot: "contact"; field: ContactField; code: string }
    | { slot: "send"; field: ContactField };

export const accountOf = ( user: ProfileRow ): Account => {

    const purse = user.wallet;
    const held = purse?.currency ?? baseCurrency;

    return {
        id: user.id,
        name: user.name ?? "",
        email: user.email ?? null,
        phone: user.phone ?? null,
        image: media(user.image),
        verified: Boolean(user.verified),
        emailVerified: Boolean(user.email_verified),
        phoneVerified: Boolean(user.phone_verified),
        identity: user.identity_status ?? null,
        hasPassword: user.has_password !== false,
        level: user.level ?? 0,
        referral: user.referral?.code
            ? { code: user.referral.code, link: user.referral.urls.client ?? user.referral.urls.vendor ?? null }
            : null,
        stats: {
            orders: user.orders ?? 0,
            reviews: user.reviews ?? 0,
            coupons: user.coupons ?? 0,
            referrals: user.referrals ?? 0,
        },
        wallet: purse
            ? {
                currency: cashOr(purse.available_balance, held).currency,
                total: cashOr(purse.total_balance, held).amount,
                available: cashOr(purse.available_balance, held).amount,
                pending: cashOr(purse.pending_balance, held).amount,
                points: numeric(purse.points),
            }
            : null,
        location: user.geo
            ? {
                address: user.geo.address ?? "",
                address2: user.geo.address_2 ?? "",
                zipCode: user.geo.zip_code ?? "",
                city: user.geo.city?.name ?? "",
                country: user.geo.country?.name ?? "",
            }
            : null,
        preferences: {
            language: user.language ?? "",
            currency: user.currency ?? "",
            theme: user.theme ?? "",
        },
        permissions: user.permissions ?? [],
    };

};

const channelOrder: readonly string[] = [ "broadcast", "push", "mail", "sms", "whatsapp" ];

const rank = ( key: string ): number => {

    const seat = channelOrder.indexOf(key);

    return seat < 0 ? channelOrder.length : seat;

};

export const settingsOf = ( data: SettingsRow ): Settings => ({
    theme: data.theme ?? "",
    currency: data.currency ?? "",
    language: data.language ?? "",
    confirmWay: data.confirmation_way ?? "",
    topics: Object.entries(oneOf(data.notify_prefs) ?? {}).map(([ key, topic ]) => ({
        key,
        on: topic.enabled ?? false,
        forced: topic.forced ?? false,
        channels: Object.entries(oneOf(topic.channels) ?? {})
            .map(([ channel, on ]) => ({ key: channel, on }))
            .sort(( one, two ) => rank(one.key) - rank(two.key) ),
    })),
});

export const notifyBody = ( patch: NotifyPatch ): NotifyBody => ({
    notify_prefs: {
        [patch.topic]: {
            ...( patch.on === undefined ? {} : { enabled: patch.on } ),
            ...( patch.channel ? { channels: { [patch.channel.key]: patch.channel.on } } : {} ),
        },
    },
});

export const locationBody = ( input: AccountLocationInput ): LocationBody => ({
    address: input.address,
    address_2: input.address2,
    zip_code: input.zipCode,
});
