"use client";

import type { Preferences } from "@engine/cookie";
import { Failure } from "@engine/error";
import { readJson, send } from "@engine/net";

export type { Preferences };
export type Saved = { language: string; currency: string; theme: string };

const endpoint = "/api/preferences";
const accept = { accept: "application/json" };

async function answer<T> ( response: Response ): Promise<T> {
    if ( !response.ok ) throw new Failure("http", { status: response.status });

    const body = await readJson(response, 64 * 1024) as { data?: T } | null;

    if ( !body?.data ) throw new Failure("response");

    return body.data;
}
export async function loadPreferences ( signal?: AbortSignal ): Promise<Saved> {
    const { response } = await send(endpoint, { headers: accept }, { timeoutMs: 5000, signal });

    return answer<Saved>(response);
}
export async function savePreferences ( change: Preferences ): Promise<Preferences> {
    const { response } = await send(endpoint, { method: "POST", headers: { ...accept, "content-type": "application/json" }, body: JSON.stringify(change) }, { timeoutMs: 5000 });

    return answer<Preferences>(response);
}
