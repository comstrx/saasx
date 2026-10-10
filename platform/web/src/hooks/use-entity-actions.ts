"use client";

import type { Route } from "next";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useAuthError } from "@/hooks/use-auth-error";
import { useAction } from "@/hooks/use-operation";
import { useToast } from "@/hooks/use-toast";
import { useLocale, useTranslations } from "@/lib/providers/intl";
import { routing } from "@/lib/spec/config";
import { localePath } from "@/lib/std/locale";
import { useUi } from "@/stores/provider";

export type Engaging = "categories" | "geos" | "pois" | "products";

const reasons = ["inaccurate", "inappropriate", "spam", "other"] as const;

export function useEntityActions ( feature: Engaging, id: number, saved: boolean, login: string ) {

    const t = useTranslations("engage");
    const router = useRouter();
    const path = usePathname();
    const locale = useLocale();
    const toast = useToast();
    const token = useUi(( state ) => state.token);
    const visit = useAction(feature, "visit");
    const like = useAction(feature, "like");
    const dislike = useAction(feature, "dislike");
    const save = useAction(feature, "favorite");
    const unsave = useAction(feature, "unfavorite");
    const report = useAction(feature, "report");
    const [reaction, setReaction] = useState<"like" | "dislike" | null>(null);
    const [favorite, setFavorite] = useState(saved);
    const [open, setOpen] = useState(false);
    const [reason, setReason] = useState<(typeof reasons)[number]>("inaccurate");
    const [content, setContent] = useState("");
    const seen = useRef(false);
    const failure = useAuthError(report.error);
    const input = { categories: { categoryId: id }, geos: { geoId: id }, pois: { poiId: id }, products: { productId: id } }[feature];
    const pending = like.pending || dislike.pending || save.pending || unsave.pending;

    useEffect(() => {

        if ( seen.current ) return;

        seen.current = true;
        void visit.run(input).catch(() => undefined);

    }, [input, visit.run]);

    function guard (): boolean {

        if ( token ) return true;

        router.push(`${localePath(locale, login, routing)}?${new URLSearchParams({ next: path })}` as Route);

        return false;

    }
    async function react ( choice: "like" | "dislike" ) {

        if ( pending || reaction === choice || !guard() ) return;

        const answer = await (choice === "like" ? like : dislike).run(input);

        if ( answer ) setReaction(choice);
        else toast({ title: t("failed"), tone: "error" });

    }
    async function toggle () {

        if ( pending || !guard() ) return;

        const answer = await (favorite ? unsave : save).run(input);

        if ( !answer ) {

            toast({ title: t("failed"), tone: "error" });
            return;

        }

        toast({ title: t(favorite ? "removed" : "added"), tone: "success" });
        setFavorite(!favorite);

    }
    function ask () {

        if ( !guard() ) return;

        report.clear();
        setContent("");
        setOpen(true);

    }
    async function send () {

        if ( report.pending || !content.trim() ) return;

        const answer = await report.run({ ...input, reason: t(`reasons.${reason}`), content: content.trim() });

        if ( !answer ) return;

        setOpen(false);
        toast({ title: t("sent"), tone: "success" });

    }

    return {
        t, reaction, favorite, pending, react, toggle, open, ask, send, reason, content, setContent,
        close: () => { if ( !report.pending ) setOpen(false); },
        pick: ( value: string ) => setReason(reasons.find(( entry ) => entry === value) ?? "other"),
        reasons: reasons.map(( value ) => ({ value, label: t(`reasons.${value}`) })),
        reporting: report.pending,
        error: failure,
    };

}
