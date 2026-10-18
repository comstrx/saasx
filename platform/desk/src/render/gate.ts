import { type ReactNode, useEffect } from "react";
import { useGate } from "@/hooks/use-client";
import { useRouter } from "@/hooks/use-router";

type Props = { access: readonly string[]; guest?: boolean; redirect?: string | null; children: ReactNode };

export function Gate ({ access, guest = false, redirect = null, children }: Props) {

    const router = useRouter();
    const { allowed, refused } = useGate(access, guest);

    useEffect(() => {

        if ( refused && redirect ) router.replace(redirect);

    }, [refused, redirect, router]);

    return allowed ? children : null;

}
