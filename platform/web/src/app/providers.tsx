"use client";

import type { ReactNode } from "react";
import Replayer from "@/components/replayer";
import { SessionProvider } from "@/hooks/use-client";

export function Providers ({ children }: { children: ReactNode }) {

    return <SessionProvider><Replayer />{children}</SessionProvider>;

}
