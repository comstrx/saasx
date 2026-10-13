"use client";

import type { Session, SessionActions } from "@engine/context";
import { session } from "@/stores/provider";

export function useSession (): Session & SessionActions & { ready: boolean } {

    return session.use(( state ) => state);

}
