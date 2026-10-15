import { lazyStore, memoryStore, type Store, type WebStorage, webStore } from "engine/storage";

const browser = globalThis as { localStorage?: WebStorage | undefined };

export const store: Store = lazyStore(() => (browser.localStorage ? webStore(browser.localStorage) : memoryStore()));
