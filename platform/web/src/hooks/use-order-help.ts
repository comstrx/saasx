"use client";

import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAction } from "@/hooks/use-operation";
import { useToast } from "@/hooks/use-toast";
import { useLocale } from "@/lib/providers/intl";
import { routing } from "@/lib/spec/config";
import { localePath } from "@/lib/std/locale";
import { fillPattern } from "@/lib/std/route";

type Links = { messages: string; ticket: string };
type Labels = { failed: string; opened: string };

export function useOrderHelp ( orderId: number, links: Links, labels: Labels ) {

    const router = useRouter();
    const locale = useLocale();
    const toast = useToast();
    const chat = useAction("chat", "forOrder");
    const ticket = useAction("tickets", "forOrder");
    const [open, setOpen] = useState(false);
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const ready = title.trim().length >= 2 && content.trim().length >= 5;

    async function message () {

        try {

            const answer = await chat.run({ orderId });
            const room = answer?.resource?.id;

            const target = `${localePath(locale, links.messages, routing)}?${new URLSearchParams({ room: String(room ?? "") })}`;

            if ( room ) router.push(target as Route);

        }
        catch {

            toast({ title: labels.failed, tone: "error" });

        }

    }
    async function submit () {

        if ( !ready ) return;

        try {

            const answer = await ticket.run({ orderId, title: title.trim(), content: content.trim() });
            const id = answer?.resource?.id;

            setOpen(false);
            toast({ title: labels.opened, tone: "success" });

            if ( id ) router.push(localePath(locale, fillPattern(links.ticket, { ticketId: String(id) }), routing) as Route);

        }
        catch {

            toast({ title: labels.failed, tone: "error" });

        }

    }

    return {
        message, messaging: chat.pending,
        open, setOpen, title, setTitle, content, setContent, ready, submit, submitting: ticket.pending,
        error: ticket.error,
    };

}
