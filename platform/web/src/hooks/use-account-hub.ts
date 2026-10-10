"use client";

import { useState } from "react";
import { useRead } from "@/hooks/use-operation";
import { useLocale } from "@/lib/providers/intl";
import { count, day, money } from "@/lib/std/format";
import { initials } from "@/lib/std/text";
import { useUi } from "@/stores/provider";

type Step = "email" | "phone" | "photo" | "password" | "address";
type Links = { personal: string | null; security: string | null };

const active = { limit: 1, fields: ["status"], filters: { status: ["pending", "confirmed"] } };

function moment ( hour: number ): "morning" | "afternoon" | "evening" {

    return hour < 12 ? "morning" : hour < 18 ? "afternoon" : "evening";

}
export function useAccountHub ( links: Links ) {

    const locale = useLocale();
    const ready = useUi(( state ) => state.ready);
    const signed = useUi(( state ) => Boolean(state.token && state.user));
    const [now] = useState(() => new Date());
    const account = useRead("account", "read", {}, { enabled: signed });
    const orders = useRead("orders", "list", active, { enabled: signed });
    const stats = useRead("notifications", "stats", {}, { enabled: signed, live: "notifications" });
    const loyalty = useRead("account", "loyalty", {}, { enabled: signed });
    const user = account.data?.user ?? null;
    const name = user?.name?.trim() || user?.email || user?.phone || "";
    const wallet = user?.wallet ?? null;
    const balance = wallet ? money(wallet.available_balance, locale, wallet.currency ?? undefined) : undefined;
    const steps: { key: Step; done: boolean; href: string | null }[] = user ? [
        { key: "email", done: user.email_verified === true, href: links.personal },
        { key: "phone", done: Boolean(user.phone) && user.phone_verified === true, href: links.personal },
        { key: "photo", done: Boolean(user.image), href: links.personal },
        { key: "password", done: user.has_password === true, href: links.security },
        { key: "address", done: Boolean(user.geo?.city?.name || user.geo?.country?.name), href: links.personal },
    ] : [];
    const finished = steps.filter(( step ) => step.done).length;
    const level = loyalty.data?.level ?? null;
    const conditions = level?.progress?.conditions ?? [];
    const share = ( row: (typeof conditions)[number] ) => Math.min(1, Number(row.reached ?? 0) / Math.max(1, Number(row.required ?? 1)));
    const reached = conditions.length
        ? Math.round((conditions.reduce(( sum, row ) => sum + share(row), 0) / conditions.length) * 100)
        : null;

    return {
        ready,
        signed,
        loading: signed && account.loading && !user,
        failed: signed && Boolean(account.error) && !user,
        reload: account.reload,
        moment: moment(now.getHours()),
        today: day(now, locale, { weekday: "long", day: "numeric", month: "long" }),
        user: user ? {
            name,
            first: name.split(/\s+/)[0] ?? name,
            contact: user.email || user.phone || "",
            image: user.image ?? null,
            initials: initials(name),
            verified: user.verified === true,
            attention: !(user.phone_verified === true && user.email_verified === true),
        } : null,
        steps,
        finished,
        progress: steps.length ? Math.round((finished / steps.length) * 100) : 0,
        summary: ( template: string ) => template
            .replace("{done}", count(finished, locale))
            .replace("{total}", count(steps.length, locale)),
        snapshot: {
            balance: balance ?? null,
            bookings: orders.meta?.pagination?.total ?? null,
            unread: stats.data?.unread ?? null,
            points: wallet?.points != null ? count(Number(wallet.points), locale) : null,
        },
        level: level?.current ? {
            name: level.current.name ?? "",
            image: level.current.image ?? null,
            rank: level.current.rank ?? 0,
            next: level.progress?.next_rank ?? null,
            reached,
            perks: level.perks?.length ?? 0,
        } : null,
    };

}
