"use client";

import type { ReactNode } from "react";
import { SessionProvider } from "@/stores/provider";

export function Providers ({ children }: { children: ReactNode }) {

    return <SessionProvider>{children}</SessionProvider>;

}
