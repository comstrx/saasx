"use client";

import { useState } from "react";

export function useSortMenu () {

    const [open, setOpen] = useState(false);

    return { open, setOpen, close: () => setOpen(false) };

}
