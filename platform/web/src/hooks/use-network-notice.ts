"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { useTranslations } from "@/lib/providers/intl";
import { Toast } from "@/lib/providers/ui";

export function useNetworkNotice () {

    const t = useTranslations("notice");
    const router = useRouter();
    const manager = Toast.useToastManager();
    const latest = useRef({ t, router, manager });
    const shown = useRef<string | null>(null);

    latest.current = { t, router, manager };

    useEffect(() => {

        const lost = () => {

            if ( shown.current ) return;

            const { t: words, manager: toasts } = latest.current;

            shown.current = toasts.add({ title: words("offlineTitle"), description: words("offlineBody"), type: "warning", timeout: 0 });

        };
        const back = () => {

            if ( shown.current ) latest.current.manager.close(shown.current);

            shown.current = null;
            latest.current.router.refresh();

        };

        if ( !navigator.onLine ) lost();

        window.addEventListener("offline", lost);
        window.addEventListener("online", back);

        return () => {

            window.removeEventListener("offline", lost);
            window.removeEventListener("online", back);

        };

    }, []);

}
