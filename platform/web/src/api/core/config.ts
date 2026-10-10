import { z } from "../../lib/providers/schema.ts";
import { currency } from "./fields.ts";
import { name, url } from "./wire.ts";

const liveTopics = ["notifications", "wallet", "transactions", "order", "chat", "room", "subscription"] as const;

export type LiveTopic = typeof liveTopics[number];

const placeholders = ( value: string ) => [...value.matchAll(/\{([^}]+)\}/g)].map(( match ) => match[1] ?? "");

const channel = z.object({
    channel: z.string().max(200).regex(/^(?:private-|presence-)[a-zA-Z0-9_.{}-]+$/)
        .refine(( value ) => placeholders(value).every(( key ) => ["userId", "entityId"].includes(key))),
    event: z.string().min(1).max(100).regex(/^[a-zA-Z0-9_.\\-]+$/),
});

export const channelsShape = z.partialRecord(z.enum(liveTopics), channel);

export const channelDefaults: z.output<typeof channelsShape> = {
    notifications: { channel: "private-notification.{userId}", event: "notification.event" },
    wallet: { channel: "private-wallet.{userId}", event: "wallet.event" },
    transactions: { channel: "private-transaction.{userId}", event: "transaction.event" },
    order: { channel: "private-order.{entityId}", event: "order.event" },
    chat: { channel: "presence-chat.{userId}", event: "chat.event" },
    room: { channel: "private-chat.room.{entityId}", event: "chat.event" },
    subscription: { channel: "private-subscription.{entityId}", event: "subscription.event" },
};

export const realtimeShape = z.strictObject({
    transport: z.literal("pusher"),
    channels: channelsShape.default(channelDefaults),
});

export const connectionDefaults = {
    browser: true,
    browserBaseUrl: null,
    timeoutMs: 10000,
    retries: 1,
    maxResponseBytes: 1048576,
    credentials: "omit",
} as const;
const connectionShape = z.strictObject({
    baseUrl: url,
    browser: z.boolean(),
    browserBaseUrl: url,
    timeoutMs: z.number().int().positive().max(60000),
    retries: z.number().int().min(0).max(3),
    maxResponseBytes: z.number().int().min(1024).max(10000000),
    credentials: z.enum(["omit", "same-origin", "include"]),
    development: z.strictObject({ baseUrl: url, browserBaseUrl: url }).optional(),
});
export const apiShape = z.strictObject({
    context: z.strictObject({
        spec: name,
        currency,
        authCookie: z.string().regex(/^[a-zA-Z0-9._-]+$/).nullable(),
        proxies: z.number().int().min(0).max(5),
    }),
    connections: z.record(name, connectionShape),
    realtime: realtimeShape,
});
export const apiInputShape = apiShape.extend({
    context: apiShape.shape.context.extend({ authCookie: apiShape.shape.context.shape.authCookie.default(null), proxies: z.number().int().min(0).max(5).default(1) }),
    connections: z.record(name, connectionShape.partial().extend({ baseUrl: url })),
    realtime: realtimeShape.default({ transport: "pusher", channels: channelDefaults }),
});

export type ApiInput = z.input<typeof apiInputShape>;
export type ApiConfig = z.output<typeof apiShape>;
export type Reachable = Pick<ApiConfig["connections"][string], "baseUrl" | "timeoutMs" | "retries" | "maxResponseBytes" | "credentials">;
export type RealtimeConfig = z.output<typeof realtimeShape>;
