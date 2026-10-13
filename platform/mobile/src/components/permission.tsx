
import type { CompiledPort } from "@engine/spec";
import type { ReactNode } from "react";
import { usePermission } from "@/hooks/use-permission";

type Props = { port: CompiledPort | undefined; fallback?: ReactNode | undefined; children: ReactNode };

/**
 * Shows its children only to a session allowed to run the port; nothing (or the fallback) otherwise.
 */
export default function Permission ({ port, fallback = null, children }: Props) {

    const { ready, allowed } = usePermission(port);

    if ( !ready ) return null;

    return allowed ? children : fallback;

}
