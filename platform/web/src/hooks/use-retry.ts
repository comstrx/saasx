"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

export function useRetry () {

    const router = useRouter();
    const [pending, startTransition] = useTransition();

    return { pending, retry: () => startTransition(() => router.refresh()) };

}
