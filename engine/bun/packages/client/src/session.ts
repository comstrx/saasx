import { type Defined, defineStore } from "engine/state";
import type { Store } from "engine/storage";
import { z } from "engine/validate";

const userShape = z.looseObject({ id: z.union([z.number(), z.string()]), permissions: z.array(z.string()) });
const savedShape = z.object({ token: z.string(), user: userShape });

export type SessionUser = z.infer<typeof userShape>;
export type Session = { token: string | null; user: SessionUser | null };
export type SessionActions = {
    start: ( token: string, user: SessionUser ) => void;
    end: () => void;
};
export type SessionOptions = { name: string; store: Store; onEnd?: (() => void) | undefined };

export function defineSession ({ name, store, onEnd }: SessionOptions): Defined<Session, SessionActions> {

    return defineStore<Session, SessionActions>({
        name,
        initial: { token: null, user: null },
        actions: ( set, get ) => ({
            start: ( token, user ) => set({ token, user }),
            end: () => {

                const open = get().token !== null;

                set({ token: null, user: null });

                if ( open ) onEnd?.();

            },
        }),
        persist: {
            store,
            keys: ["token", "user"],
            parse: ( value ) => savedShape.safeParse(value).data,
        },
    });

}
