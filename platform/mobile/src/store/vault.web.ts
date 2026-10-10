const key = "session-token";

export const readToken = async (): Promise<string | null> => globalThis.localStorage.getItem(key);

export const writeToken = async ( token: string ): Promise<void> => { globalThis.localStorage.setItem(key, token); };

export const clearToken = async (): Promise<void> => { globalThis.localStorage.removeItem(key); };
