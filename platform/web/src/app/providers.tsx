"use client";

import dynamic from "next/dynamic";
import type { ReactNode } from "react";
import { runtime } from "@/lib/spec/config";

const Runtime = dynamic(() => import("./runtime.tsx"));

export function Providers ({ children }: { children: ReactNode }) {

    return runtime ? <Runtime>{children}</Runtime> : children;

}
