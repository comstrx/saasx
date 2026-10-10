"use client";

import { identity } from "@/lib/spec/config";
import { storage } from "@/lib/std/browser";
import { promotionKey } from "@/lib/std/promotion";

const key = `${identity}.promotion`;
const local = storage("local");

export function rememberPromotion ( code: string ): void {

    const clean = promotionKey(code);

    if ( clean ) local.write(key, { code: clean, at: Date.now() });

}
export function storedPromotion (): string | null {

    const saved = local.read(key);
    const record = saved && typeof saved === "object" ? saved as { code?: unknown; at?: unknown } : null;
    const fresh = typeof record?.at === "number" && Date.now() - record.at < 30 * 86400000;

    return fresh && typeof record?.code === "string" ? promotionKey(record.code) : null;

}
