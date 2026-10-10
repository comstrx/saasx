"use client";

import { useRef, useState } from "react";

export function usePhotoViewer ( count: number ) {

    const [index, setIndex] = useState(0);
    const [open, setOpen] = useState(false);
    const trigger = useRef<HTMLElement | null>(null);

    function select ( next: number, element: HTMLButtonElement ) {

        trigger.current = element;
        setIndex(next);
        setOpen(true);

    }
    function move ( delta: number ) {

        setIndex(( current ) => Math.min(count - 1, Math.max(0, current + delta)));

    }

    return { index, open, setOpen, select, move, trigger };

}
