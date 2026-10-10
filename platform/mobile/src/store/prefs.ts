import { getLocales } from "expo-localization";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { configure } from "@/api/client";
import { baseCurrency, currencyByCode } from "@/model/currency";
import { languageByCode } from "@/model/language";
import { applyAppearance } from "@/std/appearance";
import { storage } from "@/store/storage";

export type ThemeMode = "system" | "light" | "dark";

type Prefs = {
    language: string;
    languageChosen: boolean;
    currency: string;
    currencyChosen: boolean;
    inheritFor: number | null;
    theme: ThemeMode;
    seeded: boolean;
    welcomed: boolean;
    storyPending: boolean;
    seen: Readonly<Record<string, boolean>>;
};

type PrefsStore = Prefs & {
    setLanguage: ( language: string ) => void;
    adoptLanguage: ( language: string ) => void;
    setCurrency: ( currency: string ) => void;
    setTheme: ( theme: ThemeMode ) => void;
    adopt: ( prefs: Partial<Pick<Prefs, "language" | "currency" | "theme">> ) => void;
    inherit: ( user: number | null ) => void;
    startStory: () => void;
    inherited: ( user: number ) => void;
    welcome: () => void;
    see: ( key: string ) => void;
    forget: ( prefix: string ) => void;
    seed: ( supported: Served ) => void;
    follow: () => void;
};

type Served = { languages: readonly string[]; currencies: readonly string[] };

const fallback: Prefs = { language: "ar", languageChosen: false, currency: baseCurrency, currencyChosen: false, inheritFor: null, theme: "dark", seeded: false, welcomed: false, storyPending: false, seen: {} };

let served: Served = { languages: [], currencies: [] };

const pick = ( wanted: string | null | undefined, allowed: readonly string[], known: ReadonlyMap<string, unknown>, last: string ) => {

    if ( !wanted ) return last;

    const match = allowed.find(( code ) => code.toLowerCase() === wanted.toLowerCase() );

    return match && known.has(match) ? match : last;

};

const devised = ( state: Prefs ) => {

    const [ device ] = getLocales();

    return {
        language: state.languageChosen ? state.language : pick(device?.languageCode, served.languages, languageByCode, state.language),
        currency: state.currencyChosen ? state.currency : pick(device?.currencyCode, served.currencies, currencyByCode, state.currency),
    };

};

export const usePrefs = create<PrefsStore>()(persist(( set ) => ({

    ...fallback,

    setLanguage: ( language ) => set({ language, languageChosen: true }),
    adoptLanguage: ( language ) => set(( state ) => state.languageChosen ? state : { language }),
    setCurrency: ( currency ) => set({ currency, currencyChosen: true }),
    setTheme: ( theme ) => set({ theme }),
    adopt: ( prefs ) => set(prefs),
    startStory: () => set({ storyPending: true }),
    inherit: ( user ) => set({ inheritFor: user }),
    inherited: ( user ) => set(( state ) => state.inheritFor === user ? { inheritFor: null } : state),
    welcome: () => set({ welcomed: true, storyPending: false }),

    see: ( key: string ) => set(( state ) => state.seen[key] ? state : { seen: { ...state.seen, [key]: true } } ),
    forget: ( prefix ) => set(( state ) => ({ seen: Object.fromEntries(Object.entries(state.seen).filter(( [ key ] ) => !key.startsWith(prefix) )) })),

    seed: ( supported ) => set(( state ) => {

        served = supported;

        if ( state.seeded ) return state;

        return { ...devised(state), seeded: true };

    }),

    follow: () => set(devised),

}), {
    name: "prefs",
    storage: createJSONStorage(() => storage),
}));

const carry = ( state: Prefs, previous?: Prefs ) => {

    configure({ locale: state.language, currency: state.currency });

    if ( !previous || state.theme !== previous.theme ) {

        void applyAppearance(state.theme);

    }

};

carry(usePrefs.getState());

usePrefs.subscribe(carry);

usePrefs.persist.onFinishHydration(( state ) => { if ( state ) carry(state); });

export const isRtl = ( language: string ) => languageByCode.get(language)?.rtl ?? false;
