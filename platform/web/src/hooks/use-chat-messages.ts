"use client";

import { useState } from "react";
import { useAction, useRead } from "@/hooks/use-operation";
import { useToast } from "@/hooks/use-toast";
import { useTranslations } from "@/lib/providers/intl";

export const quickReactions = ["👍", "❤️", "😂", "😮", "🙏"] as const;

type Reply = { id: number; author: string; text: string };

export type Stream = "messages" | "supportMessages" | "announcementMessages";

export function useChatMessages ( stream: Stream, roomId: number, reload: () => void ) {

    const t = useTranslations("messenger");
    const toast = useToast();
    const scope = stream === "supportMessages" ? {} : { roomId };
    const react = useAction(stream, "react");
    const unreact = useAction(stream, "unreact");
    const star = useAction(stream, "star");
    const unstar = useAction(stream, "unstar");
    const pin = useAction(stream, "pin");
    const unpin = useAction(stream, "unpin");
    const remove = useAction(stream, "delete");
    const restore = useAction(stream, "restore");
    const edit = useAction(stream, "edit");
    const forward = useAction(stream, "forward");
    const [inspecting, setInspecting] = useState<number | null>(null);
    const detail = useRead(stream, "view", { ...scope, messageId: inspecting ?? 0 }, { enabled: inspecting != null });
    const [editing, setEditing] = useState<{ id: number; content: string } | null>(null);
    const [forwarding, setForwarding] = useState<number | null>(null);
    const [replying, setReplying] = useState<Reply | null>(null);
    const fail = () => toast({ title: t("actionFailed"), tone: "error" });

    async function toggleReaction ( messageId: number, emoji: string, mine: string | null ) {

        const result = mine === emoji
            ? await unreact.run({ ...scope, messageId })
            : await react.run({ ...scope, messageId, reaction: emoji });

        if ( result ) reload();
        else fail();

    }
    async function toggleStar ( messageId: number, starred: boolean ) {

        const result = await (starred ? unstar : star).run({ ...scope, messageId });

        if ( !result ) {

            fail();
            return;

        }

        toast({ title: t(starred ? "unstarred" : "starred"), tone: "success" });
        reload();

    }
    async function togglePin ( messageId: number, pinned: boolean ) {

        const result = await (pinned ? unpin : pin).run({ ...scope, messageId });

        if ( !result ) {

            fail();
            return;

        }

        toast({ title: t(pinned ? "unpinned" : "pinnedMessage"), tone: "success" });
        reload();

    }
    async function discard ( messageId: number ) {

        if ( !(await remove.run({ ...scope, messageId })) ) {

            fail();
            return;

        }

        reload();
        toast({
            title: t("deletedMessage"), tone: "success",
            action: {
                label: t("undo"),
                onClick: () => { void restore.run({ ...scope, messageId }).then(( back ) => { if ( back ) reload(); }); },
            },
        });

    }
    async function saveEdit () {

        const content = editing?.content.trim();

        if ( !editing || !content || edit.pending ) return;

        if ( !(await edit.run({ ...scope, messageId: editing.id, content, type: "text" })) ) return;

        setEditing(null);
        reload();

    }
    async function sendForward ( targetRoomId: number ) {

        if ( forwarding == null || forward.pending ) return;

        if ( !(await forward.run({ ...scope, messageId: forwarding, targetRoomId })) ) {

            fail();
            return;

        }

        setForwarding(null);
        toast({ title: t("forwarded"), tone: "success" });

    }
    async function copy ( text: string ) {

        const done = !!navigator.clipboard && await navigator.clipboard.writeText(text).then(() => true, () => false);

        toast(done ? { title: t("copied"), tone: "success" } : { title: t("actionFailed"), tone: "error" });

    }

    return {
        toggleReaction, toggleStar, togglePin, discard, copy, saveEdit, sendForward,
        editing, setEditing, editPending: edit.pending, editError: edit.error ? t("actionFailed") : null,
        forwarding, setForwarding, forwardPending: forward.pending,
        replying, setReplying,
        inspecting, setInspecting,
        detail: { data: detail.data, loading: detail.loading, failed: Boolean(detail.error), reload: detail.reload },
    };

}
