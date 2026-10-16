import { getRandomValues } from "expo-crypto";

type Host = { crypto?: { getRandomValues?: unknown } };

const host = globalThis as Host;

if ( typeof host.crypto?.getRandomValues !== "function" ) host.crypto = {
    ...host.crypto,
    getRandomValues: ( array: Uint8Array ) => getRandomValues(array),
};
