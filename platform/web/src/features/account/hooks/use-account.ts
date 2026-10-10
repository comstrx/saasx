"use client";

import { useEffect, useState } from "react";
import { useRead } from "@/hooks/use-operation";
import { useLocale, useTranslations } from "@/lib/providers/intl";
import { routing } from "@/lib/spec/config";
import { localePath } from "@/lib/std/locale";
import { useUi } from "@/stores/provider";

export type AccountOptions = {
    view: string; login: string; personal: string; preferences: string; security: string; documents: string;
    notifications: string; recover: string; country: string; files: string;
};

export function useAccountEntry ( options: AccountOptions ) {

    const t = useTranslations("account");
    const locale = useLocale();
    const ready = useUi(( state ) => state.ready);
    const token = useUi(( state ) => state.token);
    const personal = localePath(locale, options.personal, routing);
    const preferences = localePath(locale, options.preferences, routing);
    const security = localePath(locale, options.security, routing);
    const notifications = localePath(locale, options.notifications, routing);
    const documents = localePath(locale, options.documents, routing);
    const href = options.view === "notifications" ? notifications : options.view === "preferences" ? preferences
        : options.view === "security" ? security : options.view === "documents" ? documents : personal;

    return {
        t, ready, token, recover: localePath(locale, options.recover, routing),
        login: `${localePath(locale, options.login, routing)}?${new URLSearchParams({ next: href })}`,
    };

}
export function useAccount () {

    const request = useRead("account", "read");
    const token = useUi(( state ) => state.token);
    const profile = useUi(( state ) => state.profile);
    const [user, setUser] = useState(request.data?.user ?? null);

    useEffect(() => {

        if ( !request.data ) return;

        const current = request.data.user;

        setUser(current);

        if ( !token ) return;

        const { id, name, email, phone, image, verified, permissions } = current;

        profile(token, { id, name, email, phone, image, verified, permissions });

    }, [request.data, token, profile]);

    return { request, user };

}
