"use client";

import { useState } from "react";

export function usePasswordField () {

    const [shown, setShown] = useState(false);

    return { shown, toggle: () => setShown(( value ) => !value) };

}
