import type { StateStorage } from "zustand/middleware";

export const storage: StateStorage = {

    getItem: ( name ) => globalThis.localStorage.getItem(name),
    setItem: ( name, value ) => { globalThis.localStorage.setItem(name, value); },
    removeItem: ( name ) => { globalThis.localStorage.removeItem(name); },

};
