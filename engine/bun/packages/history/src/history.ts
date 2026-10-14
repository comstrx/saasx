import { type Href, parseHref, type Query } from "./href.ts";

export type Entry = Href & { key: string };
export type Listener = () => void;
export type Leave = ( proceed: () => void ) => void;
export type HistoryOptions = { limit?: number | undefined; scheme?: string | undefined };
export type History = {
    entries: () => readonly Entry[];
    current: () => Entry;
    canGoBack: () => boolean;
    push: ( href: string ) => void;
    replace: ( href: string ) => void;
    navigate: ( href: string ) => void;
    tab: ( href: string ) => void;
    back: () => boolean;
    reset: ( href: string ) => void;
    setQuery: ( query: Query ) => void;
    dismissed: ( key: string ) => void;
    guard: ( key: string, leave: Leave ) => () => void;
    blocked: ( key: string ) => boolean;
    subscribe: ( listener: Listener ) => () => void;
};

const defaultLimit = 50;

export function createHistory ( initial: string, { limit = defaultLimit, scheme }: HistoryOptions = {} ): History {

    let counter = 0;
    const fresh = ( href: string ): Entry => {

        counter += 1;

        return { ...parseHref(href, scheme), key: `e${counter}` };

    };
    let stack: readonly Entry[] = [fresh(initial)];
    const listeners = new Set<Listener>();
    const guards = new Map<string, Leave>();
    const top = (): Entry => stack[stack.length - 1] as Entry;
    const commit = ( next: readonly Entry[] ): void => {

        const bounded = next.length > limit ? [next[0] as Entry, ...next.slice(next.length - limit + 1)] : next;

        if ( bounded.length === stack.length && bounded.every(( entry, index ) => entry === stack[index]) ) return;

        stack = bounded;

        for ( const listener of [...listeners] ) listener();

    };
    const leaving = ( next: readonly Entry[], change: () => void ): void => {

        const gone = stack.filter(( entry ) => !next.includes(entry));
        const held = gone.map(( entry ) => guards.get(entry.key)).find(Boolean);

        if ( !held ) {

            change();

            return;

        }

        const before = stack;

        held(() => {

            if ( stack !== before ) return;

            for ( const entry of gone ) guards.delete(entry.key);

            change();

        });

    };
    const go = ( next: readonly Entry[] ): void => leaving(next, () => commit(next));

    return {
        entries: () => stack,
        current: top,
        canGoBack: () => stack.length > 1,
        push: ( href ) => commit([...stack, fresh(href)]),
        replace: ( href ) => go([...stack.slice(0, -1), fresh(href)]),
        navigate: ( href ) => {

            const { path } = parseHref(href, scheme);
            const at = stack.findIndex(( entry ) => entry.path === path);

            if ( at === stack.length - 1 ) return;
            if ( at === -1 ) {

                commit([...stack, fresh(href)]);

                return;

            }

            go(stack.slice(0, at + 1));

        },
        tab: ( href ) => {

            const target = parseHref(href, scheme);
            const root = stack[0] as Entry;

            if ( stack.length === 1 && root.path === target.path && JSON.stringify(root.query) === JSON.stringify(target.query) ) return;

            go([{ ...target, key: root.key }]);

        },
        back: () => {

            if ( stack.length < 2 ) return false;

            go(stack.slice(0, -1));

            return true;

        },
        reset: ( href ) => go([fresh(href)]),
        setQuery: ( query ) => commit([...stack.slice(0, -1), { ...top(), query }]),
        dismissed: ( key ) => {

            const at = stack.findIndex(( entry ) => entry.key === key);

            if ( at < 1 ) return;

            for ( const entry of stack.slice(at) ) guards.delete(entry.key);

            commit(stack.slice(0, at));

        },
        guard: ( key, leave ) => {

            guards.set(key, leave);

            return () => {

                if ( guards.get(key) === leave ) guards.delete(key);

            };

        },
        blocked: ( key ) => guards.has(key),
        subscribe: ( listener ) => {

            listeners.add(listener);

            return () => {

                listeners.delete(listener);

            };

        },
    };

}
