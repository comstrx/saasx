import { isRecord, pathGet, safeKey } from "engine/base";
import { interpolate, type Scope } from "engine/parse";

export type Messages = { [key: string]: string | Messages };
export type Dictionaries = Readonly<Record<string, Messages>>;
export type Translate = ( key: string, scope?: Scope ) => string;

export function dictionary ( value: unknown, path = "messages" ): Messages {

    if ( !isRecord(value) ) throw new Error(`${path}: expected a message object.`);

    const result: Messages = {};

    for ( const [key, item] of Object.entries(value) ) {

        if ( !safeKey(key) || key.includes(".") ) throw new Error(`${path}: invalid key "${key}".`);

        if ( typeof item === "string" ) {

            if ( !item.trim() ) throw new Error(`${path}.${key}: expected non-empty text.`);

            result[key] = item;

            continue;

        }

        const nested = dictionary(item, `${path}.${key}`);

        if ( !Object.keys(nested).length ) throw new Error(`${path}.${key}: empty message group.`);

        result[key] = nested;

    }

    return result;

}
export function messageKeys ( messages: Messages, prefix = "" ): string[] {

    return Object.entries(messages)
        .flatMap(( [key, value] ) => {

            const path = prefix ? `${prefix}.${key}` : key;

            return typeof value === "string" ? [path] : messageKeys(value, path);

        })
        .sort();

}
export function messageAt ( messages: Messages, key: string ): string | undefined {

    const value = pathGet(messages, key);

    return typeof value === "string" ? value : undefined;

}
export function messageTree ( messages: Messages, key: string ): Messages | undefined {

    const value = pathGet(messages, key);

    return isRecord(value) ? (value as Messages) : undefined;

}
export function mergeMessages ( base: Messages, overrides: Messages, path = "messages" ): Messages {

    const result = { ...base };

    for ( const [key, value] of Object.entries(overrides) ) {

        const original = base[key];

        if ( !Object.hasOwn(base, key) || original === undefined ) {

            result[key] = value;

            continue;

        }

        if ( typeof original !== typeof value )
            throw new Error(`${path}.${key}: an override cannot change the message shape.`);

        result[key] =
            typeof original === "string" || typeof value === "string"
                ? value
                : mergeMessages(original, value, `${path}.${key}`);

    }

    return result;

}
export function missingKeys ( reference: Messages, other: Messages ): string[] {

    const known = new Set(messageKeys(other));

    return messageKeys(reference).filter(( key ) => !known.has(key));

}
export function translator ( messages: Messages, onMissing?: ( key: string ) => void ): Translate {

    return ( key, scope = {} ) => {

        const found = messageAt(messages, key);

        if ( found === undefined ) {

            onMissing?.(key);

            return key;

        }

        return interpolate(found, scope);

    };

}
