"use client";

import { useRef } from "react";
import { useAction } from "@/hooks/use-operation";

const gap = 4000;

export function useChatTyping ( roomId: number ) {

    const typing = useAction("chat", "typing");
    const last = useRef(0);

    return () => {

        const now = Date.now();

        if ( !roomId || now - last.current < gap ) return;

        last.current = now;
        void typing.run({ roomId }).catch(() => undefined);

    };

}
