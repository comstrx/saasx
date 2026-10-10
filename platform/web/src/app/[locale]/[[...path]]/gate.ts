"use client";

import type { ReactNode } from "react";
import { useUi } from "@/stores/provider";

type Props = { permissions: readonly string[]; children: ReactNode };

export function Gate ({ permissions, children }: Props) {

    const user = useUi(( state ) => (state.token ? state.user : null));
    const held = user?.permissions ?? [];
    const granted = user !== null && permissions.every(( permission ) => permission === "user" || held.includes(permission));

    return granted ? children : null;

}
