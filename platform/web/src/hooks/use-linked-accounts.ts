"use client";

import { useEffect, useRef, useState } from "react";
import { useAuthError } from "@/hooks/use-auth-error";
import { useAction, useRead } from "@/hooks/use-operation";
import { useToast } from "@/hooks/use-toast";
import { useTranslations } from "@/lib/providers/intl";
import { socialGlyph, socialName } from "@/lib/std/social";

const returned = ["attached", "status", "error"] as const;

function here (): URL {

    const url = new URL(window.location.href);

    for ( const key of returned ) {

        url.searchParams.delete(key);

    }

    return url;

}
export function useLinkedAccounts ( hasPassword: boolean ) {

    const t = useTranslations("accountSecurity");
    const toast = useToast();
    const providers = useRead("auth", "providers");
    const socials = useRead("account", "socials");
    const link = useAction("account", "linkSocial");
    const unlink = useAction("account", "unlinkSocial");
    const [selected, setSelected] = useState<string | null>(null);
    const [removal, setRemoval] = useState<string | null>(null);
    const announced = useRef(false);
    const linked = (socials.data ?? []).filter(( entry ) => entry.active !== false);
    const methods = linked.length + (hasPassword ? 1 : 0);
    const linkError = useAuthError(link.error);
    const unlinkError = useAuthError(unlink.error);

    useEffect(() => {

        if ( announced.current ) return;

        announced.current = true;

        const params = new URL(window.location.href).searchParams;
        const attached = params.get("attached");
        const failed = params.get("error");

        if ( !attached && !failed ) return;

        window.history.replaceState(window.history.state, "", here());
        toast(attached && !failed
            ? { title: t("socialLinked", { provider: socialName(attached) }), tone: "success" }
            : { title: t(failed === "account" ? "socialLinkRefused" : "socialLinkFailed"), tone: "error" });

    }, [t, toast]);

    async function connect ( provider: string ) {

        if ( link.pending ) return;

        setSelected(provider);

        const result = await link.run({ provider, callback: here().href });

        if ( result ) window.location.assign(result.resource.url);
        else setSelected(null);

    }
    function ask ( provider: string ) {

        if ( unlink.pending ) return;

        unlink.clear();
        setRemoval(provider);

    }
    function close () {

        if ( !unlink.pending ) setRemoval(null);

    }
    async function disconnect () {

        if ( !removal || unlink.pending ) return;

        const result = await unlink.run({ provider: removal });

        if ( !result ) return;

        toast({ title: t("socialUnlinked", { provider: socialName(removal) }), tone: "success" });
        setRemoval(null);
        socials.reload();

    }

    return {
        t, selected, removal, ask, close, connect, disconnect,
        removing: removal ? socialName(removal) : "",
        loading: (providers.loading || socials.loading) && !socials.data,
        failed: Boolean(providers.error || socials.error),
        reload: () => { providers.reload(); socials.reload(); },
        linking: link.pending, unlinking: unlink.pending, linkError, unlinkError,
        locked: !hasPassword && methods <= 1 && linked.length > 0,
        rows: (providers.data?.providers ?? []).map(( provider ) => {

            const account = linked.find(( entry ) => entry.provider === provider);

            return {
                provider, name: socialName(provider), glyph: socialGlyph(provider), linked: Boolean(account),
                detail: account?.email || account?.name || null, last: Boolean(account) && !hasPassword && methods <= 1,
            };

        }),
    };

}
