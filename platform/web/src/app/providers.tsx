"use client";

import type { ReactNode } from "react";
import Replayer from "@/components/replayer";
import { SessionProvider } from "@/stores/provider";

export function Providers ({ children }: { children: ReactNode }) {

    return <SessionProvider><Replayer />{children}</SessionProvider>;

}
