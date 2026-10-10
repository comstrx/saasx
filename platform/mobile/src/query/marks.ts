import { create } from "zustand";

type MarkStore = {
    marks: Readonly<Record<number, boolean>>;
    mark: ( id: number, on: boolean ) => void;
    unmark: ( id: number ) => void;
};

const createMarks = () => create<MarkStore>(( set ) => ({

    marks: {},

    mark: ( id, on ) => set(( state ) => ({ marks: { ...state.marks, [id]: on } }) ),

    unmark: ( id ) => set(( state ) => {

        const { [id]: dropped, ...rest } = state.marks;

        return dropped === undefined ? state : { marks: rest };

    }),

}));

export const useCartMarks = createMarks();

export const useFavoriteMarks = createMarks();

export const clearMarks = () => {

    useCartMarks.setState({ marks: {} });
    useFavoriteMarks.setState({ marks: {} });

};
