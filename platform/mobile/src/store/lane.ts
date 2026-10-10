import { create } from "zustand";

type LaneStore = {
    held: boolean;
    owned: number;
    hold: ( held: boolean ) => void;
    own: () => () => void;
};

export const useLane = create<LaneStore>(( set ) => ({

    held: false,
    owned: 0,
    hold: ( held ) => set({ held }),
    own: () => {

        set(( state ) => ({ owned: state.owned + 1 }));

        return () => set(( state ) => ({ owned: state.owned - 1 }));

    },

}));
