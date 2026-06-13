"use client";

import { create } from "zustand";

const year = 60 * 60 * 24 * 365;
const marker = Symbol("persisted");

type Tier = "local" | "cookie";
type Definition = Record <string, unknown>;

type Persisted <T> = {
    [marker]: true;
    initial: T;
    tier: Tier;
};
type State <D extends Definition> = {
    [K in keyof D]: D[K] extends Persisted<infer T> ? T : D[K];
};

function wrap <T> ( initial: T, tier: Tier ): T {

    return { [marker]: true, initial, tier } satisfies Persisted<T> as T;

}
function isPersisted ( value: unknown ): value is Persisted<unknown> {

    return typeof value === "object" && value !== null && (value as Persisted<unknown>)[marker] === true;

}
function parse ( text: string | null ) {

    if ( text === null ) return undefined;

    try { return JSON.parse(text) as unknown; } catch { return undefined; }

}
function readStored ( id: string, tier: Tier ) {

    if ( typeof window === "undefined" ) return undefined;
    if ( tier === "local" ) return parse(window.localStorage.getItem(id));

    const match = document.cookie.match(new RegExp(`(?:^|; )${id}=([^;]*)`));
    const value = match?.[1];

    return parse(value === undefined ? null : decodeURIComponent(value));

}
function writeStored ( id: string, tier: Tier, value: unknown ) {

    if ( typeof window === "undefined" ) return;
    if ( tier === "local" ) return window.localStorage.setItem(id, JSON.stringify(value));

    document.cookie = `${id}=${encodeURIComponent(JSON.stringify(value))}; path=/; max-age=${year}; samesite=lax`;

}
function eraseStored ( id: string, tier: Tier ) {

    if ( typeof window === "undefined" ) return;
    if ( tier === "local" ) return window.localStorage.removeItem(id);

    document.cookie = `${id}=; path=/; max-age=0`;

}

export function local <T> ( initial: T ): T {

    return wrap(initial, "local");

}
export function shared <T> ( initial: T ): T {

    return wrap(initial, "cookie");

}
export function createStore <D extends Definition> ( name: string, definition: D ) {

    const initial = {} as State<D>;
    const tiers = new Map<string, Tier>();

    for ( const [key, value] of Object.entries(definition) ) {

        if ( !isPersisted(value) ) {

            initial[key as keyof D] = value as State<D>[keyof D];
            continue;

        }

        tiers.set(key, value.tier);

        const stored = readStored(`${name}.${key}`, value.tier);

        initial[key as keyof D] = (stored === undefined ? value.initial : stored) as State<D>[keyof D];

    }

    const useStore = create<State<D>>(() => initial);

    const write = ( patch: Partial<State<D>> ) => {

        useStore.setState(patch);

        for ( const [key, value] of Object.entries(patch) ) {

            const tier = tiers.get(key);

            if ( tier ) writeStored(`${name}.${key}`, tier, value);

        }

    };
    const erase = ( key: string ) => {

        const tier = tiers.get(key);

        if ( tier ) eraseStored(`${name}.${key}`, tier);

    };

    return Object.assign(useStore, {

        get: <K extends keyof State<D>> ( key: K ) => useStore.getState()[key],
        read: () => useStore.getState(),
        set: <K extends keyof State<D>> ( key: K, value: State<D>[K] ) => write({ [key]: value } as Partial<State<D>>),
        update: ( patch: Partial<State<D>> ) => write(patch),
        delete: <K extends keyof State<D>> ( key: K ) => { write({ [key]: initial[key] } as Partial<State<D>>); erase(key as string); },
        reset: () => { write(initial); for ( const key of tiers.keys() ) erase(key); },

    });

}
