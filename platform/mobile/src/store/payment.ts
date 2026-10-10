import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { PaymentTarget, PendingPayment } from "@/model/payment";
import { storage } from "@/store/storage";

type PaymentStore = {
    pending: PendingPayment | null;
    hold: ( target: PaymentTarget ) => void;
    clear: () => void;
};

export const usePendingPayment = create<PaymentStore>()(persist(( set ) => ({

    pending: null,

    hold: ( target ) => set({ pending: { target, at: Date.now() } }),

    clear: () => set({ pending: null }),

}), {
    name: "payment",
    storage: createJSONStorage(() => storage),
}));

export const holdPayment = ( target: PaymentTarget ) => usePendingPayment.getState().hold(target);

export const clearPayment = () => usePendingPayment.getState().clear();
