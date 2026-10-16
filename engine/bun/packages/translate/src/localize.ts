import { isRecord, mapValues } from "engine/base";
import { type Messages, messageAt, messageTree } from "./messages.ts";

export type MessageKey = { key: string };
export type MessageText = string | MessageKey;
export type Localized<T> = T extends string | number | boolean | null | undefined
    ? T
    : T extends readonly (infer U)[]
      ? Localized<U>[]
      : T extends { key: string }
        ? [keyof T] extends ["key"]
            ? string
            : { [K in keyof T]: Localized<T[K]> }
        : { [K in keyof T]: Localized<T[K]> };

export const messageKeyPattern = /^[^.\s]+(?:\.[^.\s]+)*$/;

export function isMessageKey ( value: unknown ): value is MessageKey {

    return isRecord(value) && Object.keys(value).length === 1 && typeof value.key === "string" && messageKeyPattern.test(value.key);

}
export function messageText ( value: MessageText, messages: Messages, locale: string ): string {

    if ( typeof value === "string" ) return value;

    const found = messageAt(messages, value.key);

    if ( found === undefined ) throw new Error(`Missing ${locale} message: ${value.key}`);

    return found;

}
export function localizeTree<T> ( value: T, messages: Messages, locale: string ): Localized<T> {

    const walk = ( item: unknown ): unknown => {

        if ( isMessageKey(item) ) return messageTree(messages, item.key) ?? messageText(item, messages, locale);
        if ( Array.isArray(item) ) return item.map(walk);
        if ( isRecord(item) ) return mapValues(item, walk);

        return item;

    };

    return walk(value) as Localized<T>;

}
