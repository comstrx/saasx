import { isRecord } from "./object.ts";

export const notificationTopics = [
    "creation", "orders", "tracking", "finance", "products", "catalog", "news", "marketing", "profile", "logins", "chat",
    "support", "security", "system",
] as const;
export const notificationChannels = ["broadcast", "mail", "email", "sms", "whatsapp", "push", "chat"] as const;

export type NotificationTopic = { enabled: boolean; forced: boolean; channels: Record<string, boolean> };
export type NotificationPreferences = Record<string, NotificationTopic>;
export type NotificationChange = { enabled?: boolean; channels?: Record<string, boolean> };

export function notificationPreferences ( value: unknown ): NotificationPreferences {

    if ( !isRecord(value) ) return {};

    return Object.fromEntries(Object.entries(value).filter(( [, topic] ) => isRecord(topic)).map(( [key, topic] ) => {

        const item = topic as Record<string, unknown>;
        const forced = item.forced === true;
        const channels = isRecord(item.channels) ? item.channels : {};

        return [key, {
            enabled: forced || item.enabled === true, forced,
            channels: Object.fromEntries(Object.entries(channels).map(( [channel, enabled] ) => [channel, forced || enabled === true])),
        }];

    }));

}
export function notificationDraft ( source: NotificationPreferences, previous: NotificationPreferences ): NotificationPreferences {

    return Object.fromEntries(Object.entries(source).map(( [key, topic] ) => {

        const held = previous[key];

        return [key, {
            ...topic,
            enabled: topic.forced || (held?.enabled ?? topic.enabled),
            channels: Object.fromEntries(Object.entries(topic.channels).map(( [channel, enabled] ) => [
                channel, topic.forced || (held?.channels[channel] ?? enabled),
            ])),
        }];

    }));

}
export function notificationInput ( value: NotificationPreferences ) {

    return Object.fromEntries(Object.entries(value).map(( [key, topic] ) => [
        key, { enabled: topic.enabled, channels: topic.channels },
    ]));

}
export function notificationLabel ( value: string ): string {

    const words = value.replace(/[_-]+/g, " ").trim();

    return words.charAt(0).toUpperCase() + words.slice(1);

}
