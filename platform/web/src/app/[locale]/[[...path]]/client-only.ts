"use client";

import type { ReactNode } from "react";
import { useMounted } from "@/hooks/use-effects";

export function ClientOnly ({ children }: { children: ReactNode }) {

    return useMounted() ? children : null;

}
