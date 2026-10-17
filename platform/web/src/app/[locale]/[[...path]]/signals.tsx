"use client";

import dynamic from "next/dynamic";
import type { ReactNode } from "react";
import { runtime } from "@/lib/spec/config";

const Provider = dynamic(() => import("@/hooks/use-client").then(( module ) => ({ default: module.SignalsProvider })));

export function Signals ({ children }: { children: ReactNode }) {

    return runtime ? <Provider>{children}</Provider> : children;

}
