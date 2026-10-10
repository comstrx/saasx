"use client";

import type { Route } from "next";
import { usePathname, useRouter } from "next/navigation";
import { useAction } from "@/hooks/use-operation";
import { useToast } from "@/hooks/use-toast";
import { useLocale } from "@/lib/providers/intl";
import { routing } from "@/lib/spec/config";
import { localePath } from "@/lib/std/locale";
import { useUi } from "@/stores/provider";

export function useContactHost ( productId: number, links: { messages: string; login: string }, failed: string ) {

    const router = useRouter();
    const locale = useLocale();
    const path = usePathname();
    const toast = useToast();
    const signed = useUi(( state ) => Boolean(state.token && state.user));
    const open = useAction("chat", "forProduct");

    async function contact () {

        if ( !signed ) {

            router.push(`${localePath(locale, links.login, routing)}?${new URLSearchParams({ next: path })}` as Route);
            return;

        }
        try {

            const answer = await open.run({ productId });
            const room = answer?.resource?.id;

            const target = `${localePath(locale, links.messages, routing)}?${new URLSearchParams({ room: String(room ?? "") })}`;

            if ( room ) router.push(target as Route);

        }
        catch {

            toast({ title: failed, tone: "error" });

        }

    }

    return { contact, pending: open.pending };

}
