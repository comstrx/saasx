import { bind, defineStore } from "@engine/context";
import { negotiate } from "@engine/translate";
import { device } from "@/lib/providers/device";
import { store } from "@/lib/providers/storage";
import { routing, storage } from "@/lib/spec/config";
import type { Locale } from "@/lib/spec/languages";
import { config } from "@/lib/spec/runtime";

export type Preferences = { language: Locale; currency: string; theme: "light" | "dark" | "system" };

const themes = config.settings.theme.enabled;
const currencies = config.settings.currency.enabled;
const detected = negotiate(device.info().languages.join(","), routing.locales) as Locale | undefined;

export const preferencesStore = defineStore({
    name: storage.preferences,
    initial: { language: detected ?? routing.defaultLocale, currency: config.settings.currency.default, theme: config.settings.theme.default } as Preferences,
    actions: ( set ) => ({
        choose: ( change: Partial<Preferences> ) => set(( state ) => ({ ...state, ...change })),
    }),
    persist: {
        store,
        keys: ["language", "currency", "theme"],
        parse: ( saved ) => {

            const given = saved as Partial<Preferences>;

            return {
                ...(given.language && routing.locales.includes(given.language) ? { language: given.language } : {}),
                ...(given.currency && currencies.includes(given.currency) ? { currency: given.currency } : {}),
                ...(given.theme && themes.includes(given.theme) ? { theme: given.theme } : {}),
            };

        },
    },
});
export const preferences = bind(preferencesStore);
export const PreferencesProvider = preferences.Provider;
