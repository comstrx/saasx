"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export function useMobileMenu () {

    const path = usePathname();
    const [open, setOpen] = useState(false);

    useEffect(() => {

        if ( path ) setOpen(false);

    }, [path]);

    return { open, setOpen, show: () => setOpen(true) };

}
