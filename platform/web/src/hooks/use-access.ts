"use client";

import { granted } from "@engine/spec";
import { useSession } from "@/hooks/use-session";

export function useAccess ( access: readonly string[] ): "pending" | "granted" | "denied" {

    const session = useSession();

    if ( !session.ready ) return "pending";

    return granted(session.user, access) ? "granted" : "denied";

}
