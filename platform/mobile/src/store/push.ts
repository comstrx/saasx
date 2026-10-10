import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { storage } from "@/store/storage";

type PushStore = {
    registered: string | null;
    settle: ( token: string ) => void;
    clear: () => void;
};

export const usePush = create<PushStore>()(persist(( set ) => ({

    registered: null,

    settle: ( token ) => set({ registered: token }),

    clear: () => set({ registered: null }),

}), {
    name: "push",
    storage: createJSONStorage(() => storage),
}));
