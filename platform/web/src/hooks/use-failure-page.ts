"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "@/lib/providers/intl";

export function useFailurePage ( onRetry: () => void ) {

    const t = useTranslations("notice");
    const [offline, setOffline] = useState(false);

    useEffect(() => {

        const sync = () => setOffline(!navigator.onLine);
        const back = () => { setOffline(false); onRetry(); };

        sync();
        window.addEventListener("offline", sync);
        window.addEventListener("online", back);

        return () => {

            window.removeEventListener("offline", sync);
            window.removeEventListener("online", back);

        };

    }, [onRetry]);

    return { t, offline };

}
