"use client";

import type { CompiledPort } from "engine/spec";
import type { ReactNode } from "react";
import { usePermission } from "@/hooks/use-client";

type Props = { port: CompiledPort | undefined; fallback?: ReactNode | undefined; children: ReactNode };

export default function Permission ({ port, fallback = null, children }: Props) {

    const { ready, allowed } = usePermission(port);

    if ( !ready ) return null;

    return allowed ? children : fallback;

}
