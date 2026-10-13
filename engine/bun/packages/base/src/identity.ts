import { randomBytes } from "./platform.ts";

export const identifier = /^[a-zA-Z0-9_.-]{1,100}$/;

function hex ( bytes: Uint8Array ): string {

    return Array.from(bytes, ( byte ) => byte.toString(16).padStart(2, "0")).join("");

}
export function uuid (): string {

    const bytes = randomBytes(16);

    bytes[6] = ((bytes[6] ?? 0) & 0x0f) | 0x40;
    bytes[8] = ((bytes[8] ?? 0) & 0x3f) | 0x80;

    const text = hex(bytes);

    return `${text.slice(0, 8)}-${text.slice(8, 12)}-${text.slice(12, 16)}-${text.slice(16, 20)}-${text.slice(20)}`;

}
export function trace ( incoming: string | null | undefined ): string {

    return incoming && identifier.test(incoming) ? incoming : uuid();

}
