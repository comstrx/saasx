import { z } from "zod";
import { ApiError, call, upload } from "@/api/client";
import { authUser, decimal, dict, money } from "@/api/contracts";
import type { UploadFile } from "@/std/file";
import { key } from "@/std/key";

export type Proof = {
    password?: string | undefined;
    confirm_code?: string | undefined;
};

const profile = z.object({ user: authUser });

const flags = z.union([ z.record(z.string(), z.boolean()), z.array(z.unknown()) ]).nullable().optional();

const topics = z.union([
    z.record(z.string(), z.object({
        enabled: z.boolean().nullable().optional(),
        forced: z.boolean().nullable().optional(),
        channels: flags,
    })),
    z.array(z.unknown()),
]).nullable().optional();

const preferences = z.object({
    theme: z.string().nullable().optional(),
    currency: z.string().nullable().optional(),
    language: z.string().nullable().optional(),
    confirmation_way: z.string().nullable().optional(),
    notify_prefs: topics,
});

type DevicePlatform = "ios" | "android" | "web";

export type DeviceInput = {
    token: string;
    platform: DevicePlatform;
    locale: string;
};

const wallet = z.object({
    currency: z.string().nullable().optional(),
    total_balance: money,
    available_balance: money,
    pending_balance: money,
    points: decimal,
}).nullable().optional();

const place = z.object({
    address: z.string().nullable().optional(),
    address_2: z.string().nullable().optional(),
    zip_code: z.string().nullable().optional(),
    city: z.object({ name: z.string().nullable().optional() }).nullable().optional(),
    country: z.object({ name: z.string().nullable().optional() }).nullable().optional(),
}).nullable().optional();

const referral = z.object({
    code: z.string().nullable().optional(),
    path: z.string().nullable().optional(),
    urls: dict(z.string()),
}).nullable().optional();

const full = z.object({
    user: z.object({
        id: z.number(),
        name: z.string().nullable().optional(),
        email: z.string().nullable().optional(),
        phone: z.string().nullable().optional(),
        image: z.string().nullable().optional(),
        verified: z.boolean().nullable().optional(),
        email_verified: z.boolean().nullable().optional(),
        phone_verified: z.boolean().nullable().optional(),
        identity_status: z.string().nullable().optional(),
        has_password: z.boolean().nullable().optional(),
        level: z.number().nullable().optional(),
        referral,
        language: z.string().nullable().optional(),
        currency: z.string().nullable().optional(),
        theme: z.string().nullable().optional(),
        orders: z.number().nullable().optional(),
        reviews: z.number().nullable().optional(),
        coupons: z.number().nullable().optional(),
        referrals: z.number().nullable().optional(),
        wallet,
        geo: place,
        permissions: z.array(z.string()).nullable().optional(),
    }),
});

const staged = z.object({
    pending: z.string().nullable().optional(),
    verifying_over: z.string().nullable().optional(),
});

const perk = z.object({
    key: z.string(),
    value_type: z.string().nullable().optional(),
    value: money,
    rate_ppm: decimal,
    cap: money,
});

const condition = z.object({
    key: z.string(),
    window: z.number().nullable().optional(),
    money: z.boolean().nullable().optional(),
    required: decimal,
    reached: decimal,
    remaining: decimal,
    met: z.boolean().nullable().optional(),
});

const standing = z.object({
    level: z.object({
        current: z.object({
            id: z.number(),
            rank: z.number().nullable().optional(),
            name: z.string().nullable().optional(),
            image: z.string().nullable().optional(),
        }).nullable(),
        perks: z.array(perk),
        progress: z.object({
            next_rank: z.number().nullable().optional(),
            conditions: z.array(condition),
        }).nullable(),
    }),
});

const ladder = z.array(z.object({
    id: z.number(),
    rank: z.number().nullable().optional(),
    name: z.string().nullable().optional(),
    color: z.string().nullable().optional(),
    description: z.string().nullable().optional(),
    perks: z.array(perk).nullable().optional(),
    benefits: z.array(z.object({
        key: z.string().nullable().optional(),
        label: z.string().nullable().optional(),
    })).nullable().optional(),
}));

const earned = z.object({
    rewards: z.array(z.object({
        id: z.number(),
        occurrence: z.string().nullable().optional(),
        created_at: z.string().nullable().optional(),
        snapshot: z.object({
            type: z.string().nullable().optional(),
            amount: money,
            points: decimal,
        }).nullable().optional(),
        reward: z.object({
            key: z.string().nullable().optional(),
            type: z.string().nullable().optional(),
        }).nullable().optional(),
    })),
});

export type ProfileRow = z.infer<typeof full>["user"];

export type SettingsRow = z.infer<typeof preferences>;

export type PerkRow = z.infer<typeof perk>;

export type StandingRow = z.infer<typeof standing>["level"];

export type TierRow = z.infer<typeof ladder>[number];

export type RewardRow = z.infer<typeof earned>["rewards"][number];

export type ContactKind = "email" | "phone";

export type LocationBody = {
    address: string;
    address_2: string;
    zip_code: string;
};

type SettingsBody = Partial<Record<"language" | "currency" | "theme", string>>;

export type NotifyBody = {
    notify_prefs: Record<string, { enabled?: boolean; channels?: Record<string, boolean> }>;
};

export const account = {

    me: () => call({ path: "account", schema: profile }).then(( data ) => data.user ),

    profile: async (): Promise<ProfileRow> => ( await call({ path: "account", schema: full }) ).user,

    logout: () => call({ path: "account/logout", method: "POST", idempotencyKey: key.attempt("logout") }),

    registerDevice: ( input: DeviceInput ) =>
        call({
            path: "account/devices",
            method: "POST",
            body: { token: input.token, platform: input.platform, locale: input.locale },
            idempotencyKey: key.attempt(`device:${ input.token }`),
        }),

    removeDevice: ( token: string ) =>
        call({ path: `account/devices/${ encodeURIComponent(token) }`, method: "DELETE", idempotencyKey: key.attempt(`device-drop:${ token }`) }),

    deactivate: ( proof: Proof, attempt: string ) =>
        call({ path: "account/deactivate", method: "POST", body: proof, idempotencyKey: attempt }),

    requestDeletion: ( proof: Proof, attempt: string ) =>
        call({ path: "account/request-deletion", method: "POST", body: proof, idempotencyKey: attempt }),

    saveImage: async ( file: UploadFile, attempt: string ): Promise<string> => {

        const data = await upload({
            path: "account/image",
            field: "file",
            files: [ file ],
            schema: z.object({ image: z.string().nullable().optional() }),
            idempotencyKey: attempt,
        });

        if ( !data.image ) throw new ApiError(200, "unavailable", "", { image: [ "" ] });

        return data.image;

    },

    dropImage: ( attempt: string ) =>
        call({ path: "account/image", method: "DELETE", idempotencyKey: attempt }),

    saveName: ( name: string, attempt: string ) =>
        call({ path: "account/name", method: "PUT", body: { name }, idempotencyKey: attempt }),

    savePassword: ( oldPassword: string, password: string, attempt: string ) =>
        call({
            path: "account/password",
            method: "PUT",
            body: { old_password: oldPassword, password, password_confirmation: password, logout: false },
            idempotencyKey: attempt,
        }),

    saveEmail: ( email: string, password: string, attempt: string ) =>
        call({ path: "account/email", method: "PUT", body: { email, password }, schema: staged.nullable(), idempotencyKey: attempt }),

    savePhone: ( phone: string, password: string, attempt: string ) =>
        call({ path: "account/phone", method: "PUT", body: { phone, password }, schema: staged.nullable(), idempotencyKey: attempt }),

    confirmContact: ( field: ContactKind, code: string, attempt: string ) =>
        call({ path: "account/confirm-contact", method: "POST", body: { field, code }, idempotencyKey: attempt }),

    sendCode: ( field: ContactKind, attempt: string ) =>
        call({ path: "account/send-code", method: "POST", body: { field }, idempotencyKey: attempt }),

    saveLocation: ( body: LocationBody, attempt: string ) =>
        call({ path: "account/location", method: "PUT", body, idempotencyKey: attempt }),

    saveSettings: ( body: SettingsBody | NotifyBody, attempt: string ) =>
        call({ path: "account/settings", method: "PUT", body, idempotencyKey: attempt }),

    settings: (): Promise<SettingsRow> => call({ path: "account/settings", schema: preferences }),

    level: async (): Promise<StandingRow> => ( await call({ path: "account/level", schema: standing }) ).level,

    tiers: (): Promise<readonly TierRow[]> => call({ path: "levels", schema: ladder }),

    rewards: async (): Promise<readonly RewardRow[]> => ( await call({ path: "account/rewards", schema: earned }) ).rewards,

};
