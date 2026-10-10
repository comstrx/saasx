"use client";

import { useEffect } from "react";
import FailurePage from "@/components/failure-page";
import { reportError } from "@/lib/observe/browser";
import { useLocale } from "@/lib/providers/intl";
import { routing } from "@/lib/spec/config";
import { localePath } from "@/lib/std/locale";

type Props = { error: Error & { digest?: string }; reset: () => void };

export default function Failure ({ error, reset }: Props) {

    const locale = useLocale();

    useEffect(() => { reportError(error, { feature: "page" }); }, [error]);

    return (

        <FailurePage
            art="/assets/images/brand/error.webp"
            offlineArt="/assets/images/brand/offline.webp"
            home={localePath(locale, "/", routing)}
            digest={error.digest}
            onRetry={reset}
        />

    );

}
