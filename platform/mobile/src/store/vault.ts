import { deleteItemAsync, getItemAsync, setItemAsync } from "expo-secure-store";

const key = "session-token";

export const readToken = (): Promise<string | null> => getItemAsync(key);

export const writeToken = ( token: string ): Promise<void> => setItemAsync(key, token);

export const clearToken = (): Promise<void> => deleteItemAsync(key);
