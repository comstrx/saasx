"use client";

import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAction, useRead } from "@/hooks/use-operation";
import { useToast } from "@/hooks/use-toast";
import { useTranslations } from "@/lib/providers/intl";
import { initials } from "@/lib/std/text";

export function useChatContacts ( href: ( roomId: number ) => string ) {

    const t = useTranslations("messenger");
    const router = useRouter();
    const toast = useToast();
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const contacts = useRead("chat", "contacts", { limit: 50, ...(query.trim() ? { search: query.trim() } : {}) }, { enabled: open });
    const start = useAction("chat", "open");
    const [selected, setSelected] = useState<number | null>(null);

    async function choose ( userId: number ) {

        if ( start.pending ) return;

        setSelected(userId);

        const result = await start.run({ userId });

        setSelected(null);

        if ( !result ) {

            toast({ title: t("actionFailed"), tone: "error" });
            return;

        }

        setOpen(false);
        router.push(href(result.resource.id) as Route);

    }

    return {
        open, setOpen, query, setQuery, choose, selected,
        loading: contacts.loading && !contacts.data,
        failed: Boolean(contacts.error),
        reload: contacts.reload,
        items: (contacts.data ?? []).map(( person ) => ({
            id: person.id, name: person.name ?? t("member"), image: person.image ?? null, initials: initials(person.name ?? "?"),
            role: person.role ?? null,
        })),
    };

}
