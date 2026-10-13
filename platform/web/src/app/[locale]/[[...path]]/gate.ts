"use client";

import type { Route } from "next";
import { useRouter } from "next/navigation";
import { type ReactNode, useEffect } from "react";
import { useAccess } from "@/hooks/use-access";
import { useSession } from "@/hooks/use-session";

type Props = { access: readonly string[]; guest?: boolean; redirect?: string | null; children: ReactNode };

export function Gate ({ access, guest = false, redirect = null, children }: Props) {
    const router = useRouter();
    const session = useSession();
    const state = useAccess(access);
    const allowed = guest ? session.ready && session.user === null : state === "granted";
    const refused = session.ready && !allowed;

    useEffect(() => {
        if ( refused && redirect ) router.replace(redirect as Route);
    }, [refused, redirect, router]);

    return allowed ? children : null;
}
