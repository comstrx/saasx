import { createMMKV } from "react-native-mmkv";
import type { StateStorage } from "zustand/middleware";
import { identity } from "@/brand/identity";

const mmkv = createMMKV({ id: identity.name });

export const storage: StateStorage = {

    getItem: ( name ) => mmkv.getString(name) ?? null,
    setItem: ( name, value ) => mmkv.set(name, value),
    removeItem: ( name ) => { mmkv.remove(name); },

};
