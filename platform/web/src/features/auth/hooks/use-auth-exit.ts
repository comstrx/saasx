"use client";

import type { Route } from "next";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import type { Data } from "@/api/features";
import { useLocale } from "@/lib/providers/intl";
import { routing } from "@/lib/spec/config";
import { localePath, splitLocale } from "@/lib/std/locale";
import { safeReturn } from "@/lib/std/url";
import { useUi } from "@/stores/provider";

export type AuthLinks = { login: string; register: string; recover: string; home: string };
type Reply = Data<"auth", "login">;

export function useAuthExit ( links: AuthLinks ) {

    const locale = useLocale();
    const router = useRouter();
    const query = useSearchParams();
    const join = useUi(( state ) => state.join);
    const wanted = safeReturn(query.get("next"), links.home);
    const excluded = [links.login, links.register, links.recover, "/reset", "/auth/reset", "/auth/callback", "/confirm-email"];
    const located = splitLocale(wanted.split(/[?#]/)[0] ?? "/", routing);
    const next = safeReturn(located.path, links.home, excluded) === links.home && located.path !== links.home ? links.home : wanted;
    const href = ( path: string ) => `${localePath(locale, path, routing)}?${new URLSearchParams({ next })}`;

    const finish = useCallback(( reply: Reply | undefined, origin: "login" | "register" ): boolean => {

        if ( !reply?.token || !reply.user ) return false;

        join(reply.token, reply.user, origin);
        router.replace(next as Route);

        return true;

    }, [join, router, next]);

    return { finish, next, login: href(links.login), register: href(links.register), recover: href(links.recover) };

}
