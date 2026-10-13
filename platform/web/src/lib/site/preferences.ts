import { type Preferences, preferenceJar } from "@engine/cookie";
import { preferences, routing } from "@/lib/spec/config";

export type { Preferences };

const jar = preferenceJar(preferences.cookies, routing.locales, preferences.choices.themes);

export const cookieOptions = {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: preferences.maxAge,
} as const;

export const readPreferences = jar.read;
export const acceptPreferences = jar.accept;

export function detectPreferences ( headers: Headers, saved: Preferences ): Preferences {
    return jar.detect(headers.get("accept-language"), saved);
}
export const preferenceCookies = jar.changes;
