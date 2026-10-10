import { create } from "zustand";

export type NoticeTone = "plain" | "info" | "success" | "warning" | "danger" | "delight";

export type Notice = {
    id: number;
    tone: NoticeTone;
    message: string;
};

type NoticeStore = {
    current: Notice | null;
    show: ( message: string, tone?: NoticeTone ) => void;
    clear: () => void;
};

let sequence = 0;

export const useNotice = create<NoticeStore>(( set ) => ({

    current: null,

    show: ( message, tone = "danger" ) => {

        sequence += 1;

        set({ current: { id: sequence, tone, message } });

    },

    clear: () => set({ current: null }),

}));

export const notify = ( message: string, tone?: NoticeTone ) => useNotice.getState().show(message, tone);
