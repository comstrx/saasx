"use client";

import { useEffect, useRef, useState } from "react";
import { useAction, useRead } from "@/hooks/use-operation";
import { useLocale, useTranslations } from "@/lib/providers/intl";
import { chronological, reactionsOf } from "@/lib/std/chat";
import { ago, day } from "@/lib/std/format";
import { initials } from "@/lib/std/text";

export function useAnnouncements ( enabled: boolean, selected: number, me: number | undefined, href: ( id: number ) => string ) {

    const t = useTranslations("messenger");
    const locale = useLocale();
    const [now] = useState(() => Date.now());
    const seen = useRef(0);
    const list = useRead("announcements", "list", { limit: 50 }, { enabled });
    const room = useRead("announcements", "view", { roomId: selected }, { enabled: enabled && selected > 0 });
    const messages = useRead("announcementMessages", "list", { roomId: selected, limit: 50 }, { enabled: enabled && selected > 0 });
    const read = useAction("announcements", "read");
    const seenAll = useAction("announcementMessages", "read");
    const delivered = useAction("announcementMessages", "delivered");
    const current = room.data ?? (list.data ?? []).find(( row ) => row.id === selected);

    useEffect(() => {

        if ( !selected || seen.current === selected || !messages.data ) return;

        seen.current = selected;
        void delivered.run({ roomId: selected }).catch(() => undefined);
        void seenAll.run({ roomId: selected }).catch(() => undefined);
        void read.run({ roomId: selected }).then(() => list.reload()).catch(() => undefined);

    }, [selected, messages.data, read.run, seenAll.run, delivered.run, list.reload]);

    return {
        loading: list.loading && !list.data,
        failed: Boolean(list.error),
        reload: list.reload,
        unread: (list.data ?? []).reduce(( sum, row ) => sum + (row.unread_count ?? 0), 0),
        rooms: (list.data ?? []).map(( row ) => ({
            key: `update-${row.id}`,
            href: href(row.id),
            title: row.name || t("update"),
            image: row.image ?? null,
            initials: initials(row.name || t("update")),
            preview: row.last_message?.content ?? row.description ?? null,
            time: row.last_used_at ? ago(row.last_used_at, locale, now) : null,
            unread: row.unread_count ?? 0,
            current: row.id === selected,
            flags: { pinned: false, muted: false, archived: false, blocked: false },
        })),
        thread: selected && enabled ? {
            title: current?.name || t("update"),
            image: current?.image ?? null,
            loading: messages.loading && !messages.data,
            failed: Boolean(messages.error),
            reload: () => { messages.reload(); room.reload(); },
            messages: [...(messages.data ?? [])].sort(chronological).map(( row ) => {

                const author = row.sender?.name || current?.name || t("update");

                return {
                    id: row.id, key: String(row.id), mine: false, author, image: row.sender?.image ?? current?.image ?? null,
                    initials: initials(author), text: row.content ?? "",
                    files: (row.attachments ?? []).flatMap(( file ) => file.url ? [{
                        key: String(file.id), name: file.name || t("attachment"), url: file.url,
                    }] : []),
                    quote: null, reactions: reactionsOf(row, me), reaction: row.settings?.reaction ?? null,
                    starred: row.settings?.starred === true, pinned: row.settings?.pinned === true, editable: false,
                    notes: [
                        ...(row.settings?.pinned ? [{
                            key: "pinned", label: t("pinnedNote"), icon: "push-pin", tone: "accent" as const, quiet: true,
                        }] : []),
                        ...(row.settings?.starred ? [{
                            key: "starred", label: t("starredNote"), icon: "star", tone: "ember" as const, quiet: true, fill: true,
                        }] : []),
                    ],
                    time: row.created_at ? day(row.created_at, locale, { dateStyle: "medium", timeStyle: "short" }) : null,
                };

            }),
        } : null,
    };

}
