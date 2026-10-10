"use client";

import { useState } from "react";
import { useAuthError } from "@/hooks/use-auth-error";
import { useAction, useRead } from "@/hooks/use-operation";
import { useLocale } from "@/lib/providers/intl";
import { routing } from "@/lib/spec/config";
import { localePath } from "@/lib/std/locale";
import { socialGlyph, socialName } from "@/lib/std/social";
import { safeReturn } from "@/lib/std/url";

export function useSocialSignIn ( callback: string, next: string ) {

    const locale = useLocale();
    const providers = useRead("auth", "providers");
    const redirect = useAction("auth", "socialRedirect");
    const [selected, setSelected] = useState<string | null>(null);
    const error = useAuthError(redirect.error);

    async function start ( provider: string ) {

        if ( redirect.pending ) return;

        const target = new URL(localePath(locale, callback, routing), window.location.origin);

        target.searchParams.set("next", safeReturn(next, "/"));
        setSelected(provider);

        const result = await redirect.run({ provider, callback: target.href });

        if ( result ) window.location.assign(result.resource.url);

    }

    return {
        options: (providers.data?.providers ?? []).map(( value ) => ({ value, label: socialName(value), glyph: socialGlyph(value) })),
        loading: providers.loading, failed: !!providers.error, reload: providers.reload,
        selected, pending: redirect.pending, error, start,
    };

}
