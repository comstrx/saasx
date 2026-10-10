"use client";

import { usePathname, useSearchParams } from "next/navigation";

export function useFavoriteLink ( signIn: string | null ) {

    const path = usePathname();
    const search = useSearchParams();

    return signIn ? `${signIn}?${new URLSearchParams({
        next: search.size ? `${path}?${search}` : path,
    })}` : null;

}
