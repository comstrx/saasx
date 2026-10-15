import { driverStore, type Store } from "engine/storage";
import * as SecureStore from "expo-secure-store";

export const secure: Store = driverStore({
    getItem: ( key: string ) => SecureStore.getItemAsync(key),
    setItem: ( key: string, value: string ) => SecureStore.setItemAsync(key, value),
    removeItem: ( key: string ) => SecureStore.deleteItemAsync(key),
});
