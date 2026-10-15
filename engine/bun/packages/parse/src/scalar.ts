import { Failure } from "engine/error";

const durations: Record<string, number> = { ms: 1, s: 1000, m: 60000, h: 3600000, d: 86400000 };
const sizes: Record<string, number> = { b: 1, kb: 1024, mb: 1048576, gb: 1073741824 };

export function parseJson ( text: string | null | undefined ): unknown {

    if ( !text ) return undefined;

    try {

        return JSON.parse(text) as unknown;

    } catch {

        return undefined;

    }

}
export function parseBoolean ( value: unknown ): boolean | undefined {

    if ( typeof value === "boolean" ) return value;
    if ( value === "true" || value === "1" || value === 1 ) return true;
    if ( value === "false" || value === "0" || value === 0 ) return false;

    return undefined;

}
export function parseNumber ( value: unknown ): number | undefined {

    if ( typeof value === "number" ) return Number.isFinite(value) ? value : undefined;
    if ( typeof value !== "string" || !value.trim() ) return undefined;

    const parsed = Number(value);

    return Number.isFinite(parsed) ? parsed : undefined;

}
export function parseInteger ( value: unknown ): number | undefined {

    const parsed = parseNumber(value);

    return parsed !== undefined && Number.isSafeInteger(parsed) ? parsed : undefined;

}
export function parseDuration ( value: string | number ): number {

    if ( typeof value === "number" ) return value;

    const match = /^(\d+(?:\.\d+)?)\s*(ms|s|m|h|d)?$/.exec(value.trim());
    const unit = match?.[2] ?? "ms";
    const factor = durations[unit];

    if ( !match || factor === undefined ) throw new Failure("input", { message: `Invalid duration: ${value}` });

    return Math.round(Number(match[1]) * factor);

}
export function parseBytes ( value: string | number ): number {

    if ( typeof value === "number" ) return value;

    const match = /^(\d+(?:\.\d+)?)\s*(b|kb|mb|gb)?$/i.exec(value.trim());
    const unit = (match?.[2] ?? "b").toLowerCase();
    const factor = sizes[unit];

    if ( !match || factor === undefined ) throw new Failure("input", { message: `Invalid size: ${value}` });

    return Math.round(Number(match[1]) * factor);

}
export function formatBytes ( bytes: number, digits = 1 ): string {

    const units = ["B", "KB", "MB", "GB", "TB"];
    let value = bytes;
    let index = 0;

    while ( value >= 1024 && index < units.length - 1 ) {

        value /= 1024;
        index += 1;

    }

    return `${index === 0 ? value : value.toFixed(digits)} ${units[index]}`;

}
