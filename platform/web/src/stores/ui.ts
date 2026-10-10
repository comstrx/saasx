import type { SessionUser } from "../api/features/auth.ts";
import { createStore } from "../lib/providers/store.ts";
import { isRecord } from "../lib/std/object.ts";

const effectModes = ["full", "reduced"] as const;
const texts = ["name", "email", "phone", "image", "language", "currency", "theme"] as const;

export type EffectMode = typeof effectModes[number];
export type SessionOrigin = "login" | "register";
type SessionReply = { token: string; user: SessionUser };

export type UiState = {
    effects: EffectMode; setEffects: ( effects: EffectMode ) => void;
    currency: string; setCurrency: ( currency: string ) => void;
    ready: boolean; token: string | null; user: SessionUser | null; origin: SessionOrigin | null;
    session: ( token: string | null, user: SessionUser | null ) => void;
    join: ( token: string, user: SessionUser, origin: SessionOrigin ) => void;
    profile: ( token: string, user: SessionUser ) => void;
    settle: () => void;
    hydrate: () => void;
};

function isSessionUser ( value: unknown ): value is SessionUser {

    return isRecord(value) && typeof value.id === "number" && texts.every(( key ) => value[key] == null || typeof value[key] === "string");

}
export function sessionReply ( value: unknown ): SessionReply | undefined {

    if ( !isRecord(value) || typeof value.token !== "string" || !value.token || !isSessionUser(value.user) ) return undefined;

    return { token: value.token, user: value.user };

}
export function createUiStore ( currency: string ) {

    return createStore<UiState>()(( set ) => ({
        effects: "full",
        setEffects: ( effects ) => set({ effects }),
        currency,
        setCurrency: ( next ) => set({ currency: next }),
        ready: false,
        token: null,
        user: null,
        origin: null,
        session: ( token, user ) => set({ token, user, origin: null }),
        join: ( token, user, origin ) => set({ token, user, origin }),
        profile: ( token, user ) => set(( state ) => {

            if ( state.token !== token || state.user?.id !== user.id ) return state;

            const fields = Object.fromEntries(Object.entries(user).filter(( [, value] ) => value !== undefined));

            return { user: { ...state.user, ...fields } };

        }),
        settle: () => set({ origin: null }),
        hydrate: () => set({ ready: true }),
    }));

}
