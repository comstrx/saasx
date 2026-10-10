"use client";

import { useEffect, useState } from "react";
import { useAction, useRead } from "@/hooks/use-operation";
import { useToast } from "@/hooks/use-toast";
import { useLocale } from "@/lib/providers/intl";
import { routing } from "@/lib/spec/config";
import { day as formatDay } from "@/lib/std/format";
import { localePath } from "@/lib/std/locale";
import { orderDate } from "@/lib/std/orders";
import { type DateRange, dateValue } from "@/lib/std/search";
import { useUi } from "@/stores/provider";

type Labels = { copied: string; copyFailed: string; created: string; removed: string; failed: string; updated: string };

export function usePromotionLinks ( landing: string, labels: Labels ) {

    const locale = useLocale();
    const toast = useToast();
    const signed = useUi(( state ) => Boolean(state.ready && state.token));
    const list = useRead("promotions", "list", { limit: 50 }, { enabled: signed });
    const create = useAction("promotions", "create");
    const remove = useAction("promotions", "delete");
    const update = useAction("promotions", "update");
    const [editing, setEditing] = useState<number | null>(null);
    const current = useRead("promotions", "view", { promotionId: editing ?? 0 }, { enabled: editing != null });
    const [open, setOpen] = useState(false);
    const [name, setName] = useState("");
    const [expires, setExpires] = useState<DateRange>({});
    const [picking, setPicking] = useState(false);
    const [today] = useState(() => new Date());
    const [busy, setBusy] = useState<number | null>(null);
    const origin = typeof window === "undefined" ? "" : window.location.origin;
    const link = ( path: string | null | undefined ) => (path
        ? `${origin}${localePath(locale, `${landing.replace(/\/$/, "")}/${path}`, routing)}` : null);

    async function copy ( value: string | null ) {

        if ( !value ) return;

        const done = await navigator.clipboard?.writeText(value).then(() => true, () => false);

        toast({ title: done ? labels.copied : labels.copyFailed, tone: done ? "success" : "error" });

    }
    useEffect(() => {

        const row = current.data;

        if ( !row || row.id !== editing ) return;

        setName(row.name ?? "");
        setExpires(row.expires_at ? { from: new Date(row.expires_at) } : {});

    }, [current.data, editing]);

    function toggle ( value: boolean ) {

        setOpen(value);

        if ( !value ) setEditing(null);

    }
    function begin ( id: number | null ) {

        setEditing(id);
        setName("");
        setExpires({});
        setOpen(true);

    }
    async function submit () {

        try {

            const day = expires.from ? `${dateValue(expires.from)}T23:59:59+00:00` : undefined;
            const fields = { ...(name.trim() ? { name: name.trim() } : {}), ...(day ? { expires_at: day } : {}) };

            if ( editing != null ) {

                if ( !(await update.run({ promotionId: editing, ...fields })) ) return;

                setOpen(false);
                setEditing(null);
                list.reload();
                toast({ title: labels.updated, tone: "success" });
                return;

            }

            const answer = await create.run(fields);

            if ( !answer ) return;

            setOpen(false);
            setName("");
            setExpires({});
            list.reload();
            toast({ title: labels.created, tone: "success" });
            void copy(link(answer.resource.path));

        }
        catch {

            toast({ title: labels.failed, tone: "error" });

        }

    }
    async function drop ( id: number ) {

        setBusy(id);

        try {

            await remove.run({ promotionId: id });
            list.reload();
            toast({ title: labels.removed, tone: "info" });

        }
        catch {

            toast({ title: labels.failed, tone: "error" });

        }
        finally {

            setBusy(null);

        }

    }

    return {
        signed,
        loading: list.loading && !list.data,
        failed: Boolean(list.error) && !list.data,
        reload: list.reload,
        items: (list.data ?? []).map(( row ) => ({
            id: row.id,
            name: row.name || row.code || "",
            code: row.code ?? "",
            related: row.related?.name || row.related?.title || null,
            live: row.is_live === true,
            expires: row.expires_at ? orderDate(row.expires_at, locale) : null,
            link: link(row.path),
        })),
        open, setOpen: toggle, begin, editing,
        loadingCurrent: editing != null && current.loading && !current.data, name, setName, expires, setExpires, picking, setPicking, today,
        expiresLabel: expires.from ? formatDay(expires.from, locale) : null,
        submit, creating: create.pending || update.pending, error: create.error ?? update.error,
        copy, drop, busy,
    };

}
