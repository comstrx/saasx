"use client";

import type { Route } from "next";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useAuthError } from "@/hooks/use-auth-error";
import { useAction } from "@/hooks/use-operation";
import { useToast } from "@/hooks/use-toast";
import { useTranslations } from "@/lib/providers/intl";

type Settings = { muted: boolean; pinned: boolean; archived: boolean; blocked: boolean };
type Toggle = keyof Settings;

export function useChatRoom ( roomId: number, settings: Settings, reload: () => void ) {

    const t = useTranslations("messenger");
    const toast = useToast();
    const router = useRouter();
    const path = usePathname();
    const pin = useAction("chat", "pin");
    const unpin = useAction("chat", "unpin");
    const mute = useAction("chat", "mute");
    const unmute = useAction("chat", "unmute");
    const archive = useAction("chat", "archive");
    const unarchive = useAction("chat", "unarchive");
    const block = useAction("chat", "block");
    const unblock = useAction("chat", "unblock");
    const remove = useAction("chat", "delete");
    const destroy = useAction("chat", "destroy");
    const report = useAction("chat", "report");
    const [asked, setAsked] = useState<"delete" | "report" | null>(null);
    const [reason, setReason] = useState("");
    const [content, setContent] = useState("");
    const reportError = useAuthError(report.error);
    const actions = {
        muted: [mute, unmute], pinned: [pin, unpin], archived: [archive, unarchive], blocked: [block, unblock],
    } as const;
    const pending = Object.values(actions).flat().some(( action ) => action.pending) || remove.pending || destroy.pending;

    async function toggle ( key: Toggle ) {

        const [on, off] = actions[key];
        const result = await (settings[key] ? off : on).run({ roomId });

        if ( !result ) {

            toast({ title: t("actionFailed"), tone: "error" });
            return;

        }

        toast({ title: t(`toggled.${key}.${settings[key] ? "off" : "on"}`), tone: "success" });
        reload();

    }
    async function erase ( forever: boolean ) {

        const result = await (forever ? destroy : remove).run({ roomId });

        if ( !result ) {

            toast({ title: t("actionFailed"), tone: "error" });
            return;

        }

        setAsked(null);
        toast({ title: t(forever ? "destroyed" : "deletedChat"), tone: "success" });
        router.replace(path as Route);
        reload();

    }
    async function send () {

        if ( report.pending || reason.trim().length < 2 || content.trim().length < 2 ) return;

        if ( !(await report.run({ roomId, reason: reason.trim(), content: content.trim() })) ) return;

        setAsked(null);
        setReason("");
        setContent("");
        toast({ title: t("reported"), tone: "success" });

    }

    return {
        toggle, erase, send, asked, setAsked, reason, setReason, content, setContent, pending,
        reporting: report.pending, reportError, erasing: remove.pending || destroy.pending,
    };

}
