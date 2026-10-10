"use client";

import type { Route } from "next";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useAction, useRead } from "@/hooks/use-operation";
import { useAppearance, useCurrency } from "@/hooks/use-preferences";
import { useLocale } from "@/lib/providers/intl";
import { languages } from "@/lib/spec/languages";
import { hasGlyph, type Money, money } from "@/lib/std/format";
import { initials } from "@/lib/std/text";
import { useUi } from "@/stores/provider";

type Meta = { count?: number; amount?: Money };

const active = { limit: 1, fields: ["status"], filters: { status: ["pending", "confirmed"] } };

export function useAccountTools ( signIn: string | null, basket: boolean ) {

    const router = useRouter();
    const path = usePathname();
    const search = useSearchParams();
    const locale = useLocale();
    const ready = useUi(( state ) => state.ready);
    const user = useUi(( state ) => (state.token ? state.user : null));
    const session = useUi(( state ) => state.session);
    const [open, setOpen] = useState(false);
    const logout = useAction("account", "logout");
    const appearance = useAppearance();
    const currency = useCurrency();
    const cart = useRead("cart", "list", { limit: 1 }, { enabled: basket && Boolean(user) });
    const orders = useRead("orders", "list", active, { enabled: open && Boolean(user) });
    const wallet = useRead("wallet", "read", {}, { enabled: open && Boolean(user) });
    const here = `${path}${search.size ? `?${search}` : ""}`;
    const name = user?.name?.trim() || user?.email || user?.phone || "";
    const dark = appearance.resolved === "dark";
    const balance = wallet.data ? money(wallet.data.available_balance, locale, wallet.data.currency ?? currency.value) : undefined;
    const meta: Record<string, Meta> = { orders: { count: orders.meta?.pagination?.total ?? 0 }, wallet: { amount: balance } };

    async function leave () {

        await logout.run({});
        session(null, null);
        router.refresh();

    }

    return {
        ready,
        user,
        name,
        contact: user?.email || user?.phone || "",
        image: user?.image ?? null,
        initials: initials(name),
        signIn: signIn ? (`${signIn}?${new URLSearchParams({ next: here })}` as Route) : null,
        leave,
        leaving: logout.pending,
        basket: cart.meta?.pagination?.total ?? 0,
        setOpen,
        meta,
        theme: {
            available: appearance.options.includes("light") && appearance.options.includes("dark"),
            dark,
            toggle: () => appearance.change(dark ? "light" : "dark"),
        },
        locale: { language: languages[locale].label, currency: currency.value, glyph: hasGlyph(currency.value) },
    };

}
