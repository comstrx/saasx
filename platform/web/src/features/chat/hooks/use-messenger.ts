"use client";

import type { Route } from "next";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Data } from "@/api/features";
import { useAnnouncements } from "@/hooks/use-announcements";
import { useChatContacts } from "@/hooks/use-chat-contacts";
import { useChatMessages } from "@/hooks/use-chat-messages";
import { useChatPresence } from "@/hooks/use-chat-presence";
import { useChatRoom } from "@/hooks/use-chat-room";
import { useChatSearch } from "@/hooks/use-chat-search";
import { useChatTyping } from "@/hooks/use-chat-typing";
import { useAction, useRead } from "@/hooks/use-operation";
import { useLocale, useTranslations } from "@/lib/providers/intl";
import { routing } from "@/lib/spec/config";
import { chronological, reactionsOf } from "@/lib/std/chat";
import { ago, day } from "@/lib/std/format";
import { localePath } from "@/lib/std/locale";
import { initials } from "@/lib/std/text";
import { useUi } from "@/stores/provider";

type Room = Data<"chat", "rooms">;
type Message = Data<"messages", "list">;
type Tab = "chats" | "updates" | "archived";

const tabs: readonly Tab[] = ["chats", "updates", "archived"];
const blank = { muted: false, pinned: false, archived: false, blocked: false };

function scoped ( stream: "messages" | "supportMessages", roomId: number ): Record<string, never> | { roomId: number } {

    return stream === "supportMessages" ? {} : { roomId };

}
function flagsOf ( row: Room | null | undefined ) {

    const found = row?.settings;

    return found ? { muted: !!found.muted, pinned: !!found.pinned, archived: !!found.archived, blocked: !!found.blocked } : blank;

}
export function useMessenger ( login: string ) {

    const t = useTranslations("messenger");
    const locale = useLocale();
    const path = usePathname();
    const search = useSearchParams();
    const router = useRouter();
    const ready = useUi(( state ) => state.ready);
    const token = useUi(( state ) => state.token);
    const me = useUi(( state ) => state.user);
    const signed = ready && Boolean(token);
    const tab = tabs.find(( value ) => value === search.get("tab")) ?? "chats";
    const selected = tab === "updates" ? 0 : Number(search.get("room")) || 0;
    const update = tab === "updates" ? Number(search.get("update")) || 0 : 0;
    const [filter, setFilter] = useState("");
    const [draft, setDraft] = useState("");
    const [files, setFiles] = useState<File[]>([]);
    const [now] = useState(() => Date.now());
    const read = useRef(0);
    const rooms = useRead("chat", "rooms", { limit: 50 }, { enabled: signed, live: "chat" });
    const room = useRead("chat", "room", { roomId: selected }, { enabled: signed && selected > 0 });
    const kind = (room.data ?? rooms.data?.find(( row ) => row.id === selected))?.type;
    const stream = kind === "support" ? "supportMessages" as const : "messages" as const;
    const scope = useMemo(() => scoped(stream, selected), [stream, selected]);
    const history = useRead(stream, "list", { ...scope, limit: 50 }, { enabled: signed && selected > 0 && Boolean(kind), live: "chat" });
    const send = useAction(stream, "send");
    const markRead = useAction(stream, "read");
    const delivered = useAction(stream, "delivered");
    const support = useAction("chat", "support");
    const query = ( tab: Tab, key?: string, id?: number ) => `${path}?${new URLSearchParams({
        ...(tab === "chats" ? {} : { tab }), ...(key && id ? { [key]: String(id) } : {}),
    })}`;
    const href = ( id: number ) => query(tab === "archived" ? "archived" : "chats", "room", id);
    const reloadThread = () => { history.reload(); rooms.reload(); room.reload(); };
    const actions = useChatMessages(stream, selected, reloadThread);
    const settings = flagsOf(room.data);
    const control = useChatRoom(selected, settings, reloadThread);
    const typing = useChatTyping(selected);
    const finder = useChatSearch(filter, ( id ) => query("chats", "room", id));
    const contacts = useChatContacts(( id ) => query("chats", "room", id));
    const updates = useAnnouncements(signed, update, me?.id, ( id ) => query("updates", "update", id));
    const notices = useChatMessages("announcementMessages", update, () => updates.thread?.reload());

    useChatPresence(signed);
    useEffect(() => {

        if ( !selected || read.current === selected || !history.data ) return;

        read.current = selected;
        void delivered.run(scope).catch(() => undefined);
        void markRead.run(scope).then(() => rooms.reload());

    }, [selected, history.data, markRead, delivered, rooms, scope]);

    async function submit () {

        const content = draft.trim();

        if ( (!content && !files.length) || !selected || send.pending ) return;

        const images = files.length > 0 && files.every(( file ) => file.type.startsWith("image/"));
        const answer = await send.run({
            ...scope, content, type: files.length ? images ? "image" : "file" : "text",
            ...(actions.replying ? { replied_id: actions.replying.id } : {}),
            ...(files.length ? { files } : {}),
        });

        if ( !answer ) return;

        setDraft("");
        setFiles([]);
        actions.setReplying(null);
        history.reload();
        rooms.reload();

    }
    async function contact () {

        const answer = await support.run({});

        if ( answer ) router.push(href(answer.resource.id) as Route);

    }

    const notesOf = ( row: Message, mine: boolean ) => {

        const own = row.settings;
        const receipt = mine ? row.is_read ? "read" : row.is_delivered ? "delivered" : "sent" : null;

        return [
            ...(row.is_forwarded ? [{ key: "forwarded", label: t("forwardedNote"), icon: "forward" }] : []),
            ...(row.edited ? [{ key: "edited", label: t("editedNote") }] : []),
            ...(own?.pinned ? [{ key: "pinned", label: t("pinnedNote"), icon: "push-pin", tone: "accent" as const, quiet: true }] : []),
            ...(own?.starred ? [{
                key: "starred", label: t("starredNote"), icon: "star", tone: "ember" as const, quiet: true, fill: true,
            }] : []),
            ...(receipt ? [{
                key: "receipt", label: t(`receipts.${receipt}`), icon: receipt === "sent" ? "check" : "checks",
                tone: receipt === "read" ? "accent" as const : "muted" as const, quiet: true,
            }] : []),
        ];

    };
    const infoOf = ( stream: ReturnType<typeof useChatMessages> ) => {

        const row = stream.detail.data;
        const stamp = ( value: string | null | undefined ) => (
            value ? day(value, locale, { dateStyle: "medium", timeStyle: "short" }) : null
        );
        const facts = row ? [
            { key: "sent", term: t("info.sent"), detail: stamp(row.created_at), icon: "send" },
            { key: "edited", term: t("info.edited"), detail: row.edited ? stamp(row.edited_at) ?? t("info.yes") : null, icon: "edit" },
            { key: "author", term: t("info.author"), detail: row.sender?.name ?? null, icon: "user" },
            {
                key: "status", term: t("info.status"), icon: "checks",
                detail: t(`receipts.${row.is_read ? "read" : row.is_delivered ? "delivered" : "sent"}`),
            },
            { key: "forwarded", term: t("info.forwarded"), detail: row.is_forwarded ? t("info.yes") : null, icon: "forward" },
            {
                key: "files", term: t("info.files"), icon: "paperclip",
                detail: row.attachments?.length ? String(row.attachments.length) : null,
            },
        ].flatMap(( fact ) => (fact.detail ? [{ ...fact, detail: fact.detail }] : [])) : [];

        return {
            open: stream.inspecting != null, loading: stream.detail.loading, failed: stream.detail.failed, text: row?.content ?? null,
            facts,
            onClose: () => stream.setInspecting(null), onReload: stream.detail.reload,
        };

    };
    const other = ( row: Room ) => row.members?.find(( member ) => member.user?.id !== me?.id)?.user;
    const titleOf = ( row: Room ) => row.name || (row.type === "support" ? t("supportRoom") : other(row)?.name) || t("conversation");
    const imageOf = ( row: Room ) => row.image || other(row)?.image || null;
    const listed = (rooms.data ?? [])
        .filter(( row ) => (tab === "archived") === flagsOf(row).archived)
        .filter(( row ) => !filter || titleOf(row).toLowerCase().includes(filter.toLowerCase()))
        .sort(( a, b ) => Number(flagsOf(b).pinned) - Number(flagsOf(a).pinned));

    return {
        t, ready, token, tab, selected, filter, setFilter, draft, files, submit, contact, actions, notices, control, settings, finder,
        contacts,
        setDraft: ( value: string ) => { setDraft(value); typing(); },
        addFiles: ( picked: File[] ) => setFiles(( current ) => [...current, ...picked].slice(0, 8)),
        removeFile: ( index: number ) => setFiles(( current ) => current.filter(( _, position ) => position !== index)),
        login: `${localePath(locale, login, routing)}?${new URLSearchParams({ next: path })}`,
        back: query(tab),
        sending: send.pending,
        contacting: support.pending,
        sendError: send.error ? Object.values(send.error.errors).flat()[0] || t("failed") : null,
        loading: rooms.loading && !rooms.data,
        failed: Boolean(rooms.error),
        reload: rooms.reload,
        tabs: tabs.map(( value ) => ({
            value, label: t(`tabs.${value}`), href: query(value),
            count: value === "updates" ? updates.unread : value === "chats"
                ? (rooms.data ?? []).filter(( row ) => !flagsOf(row).archived).reduce(( sum, row ) => sum + (row.unread_count ?? 0), 0) : 0,
        })),
        updates,
        info: infoOf(tab === "updates" ? notices : actions),
        rooms: tab === "updates" ? updates.rooms : listed.map(( row ) => ({
            key: String(row.id),
            href: href(row.id),
            title: titleOf(row),
            image: imageOf(row),
            initials: initials(titleOf(row)),
            preview: row.last_message?.content || (row.last_message?.type && row.last_message.type !== "text" ? t("attachment") : null),
            time: row.last_used_at ? ago(row.last_used_at, locale, now) : null,
            unread: row.unread_count ?? 0,
            current: row.id === selected,
            flags: flagsOf(row),
        })),
        targets: (rooms.data ?? []).filter(( row ) => row.id !== selected).map(( row ) => ({
            id: row.id, title: titleOf(row), image: imageOf(row), initials: initials(titleOf(row)),
        })),
        conversation: selected ? {
            title: room.data ? titleOf(room.data) : t("conversation"),
            image: room.data ? imageOf(room.data) : null,
            online: room.data?.members?.some(( member ) => member.user?.id !== me?.id && member.presence?.online) ?? false,
            loading: history.loading && !history.data,
            failed: Boolean(history.error),
            reload: history.reload,
            messages: [...(history.data ?? [])].sort(chronological).map(( row ) => {

                const mine = row.sender?.id === me?.id;
                const author = mine ? t("you") : row.sender?.name || t("member");
                const own = row.settings;

                return {
                    id: row.id, key: String(row.id), mine, author, image: row.sender?.image ?? null, initials: initials(author),
                    text: row.content ?? "",
                    files: (row.attachments ?? []).flatMap(( file ) => file.url ? [{
                        key: String(file.id), name: file.name || t("attachment"), url: file.url,
                    }] : []),
                    time: row.created_at ? day(row.created_at, locale, { hour: "numeric", minute: "2-digit" }) : null,
                    quote: row.replied ? {
                        author: row.replied.sender?.name || t("member"), text: row.replied.content || t("attachment"),
                    } : null,
                    reactions: reactionsOf(row, me?.id),
                    reaction: own?.reaction ?? null,
                    starred: own?.starred === true,
                    pinned: own?.pinned === true,
                    editable: mine && (row.type ?? "text") === "text" && !!row.content,
                    notes: notesOf(row, mine),
                };

            }),
        } : null,
    };

}
