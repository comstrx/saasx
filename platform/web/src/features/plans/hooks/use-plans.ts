import { read } from "@/api/workflow/server";
import { getLocale, getTranslations } from "@/lib/providers/intl-server";
import { routing } from "@/lib/spec/config";
import type { Locale } from "@/lib/spec/languages";
import { screens } from "@/lib/spec/server";
import { amountOf, money } from "@/lib/std/format";
import { localePath } from "@/lib/std/locale";

type Plan = Awaited<ReturnType<typeof read<"plans", "list">>>["resource"][number];
type Price = Plan["monthly_new_price"];

export type Duration = "monthly" | "yearly" | "lifetime";

function lines ( value: unknown ): string[] {

    const list = Array.isArray(value) ? value : typeof value === "string" ? value.split(/\r?\n/) : [];

    return list.flatMap(( entry ) => {

        const text = typeof entry === "string" ? entry
            : entry && typeof entry === "object" && "name" in entry && typeof entry.name === "string" ? entry.name : "";
        const clean = text.replace(/^[\s\-•*·]+/, "").trim();

        return clean ? [clean] : [];

    });

}
function quote ( now: Price, was: Price, locale: string, free: boolean ) {

    const current = amountOf(now);
    const before = amountOf(was);

    if ( !free && !current ) return null;

    return {
        now: money(now ?? 0, locale, current?.currency ?? "USD") ?? null,
        was: before && current && before.amount > current.amount ? money(was, locale, before.currency) ?? null : null,
        amount: current?.amount ?? 0,
    };

}
function badgeOf ( plan: Plan ): "recommended" | "popular" | "premium" | null {

    return plan.recommended ? "recommended" : plan.popular ? "popular" : plan.premium ? "premium" : null;

}
export async function plans ( durations: readonly Duration[], start: string, limit: number ) {

    const [locale, t] = await Promise.all([getLocale() as Promise<Locale>, getTranslations("plans")]);
    const target = screens.find(( screen ) => screen.name === start);
    const base = target ? localePath(locale, target.path, routing) : null;

    try {

        const result = await read("plans", "list", { limit });
        const rows = [...result.resource].sort(( a, b ) => (a.rank ?? 0) - (b.rank ?? 0));

        return {
            items: rows.map(( plan ) => {

                const free = plan.free === true;
                const priced = ( id: number | null | undefined, now: Price, was: Price ) => (
                    id || free ? quote(now, was, locale, free) : null
                );
                const prices = {
                    monthly: priced(plan.monthly_price_id, plan.monthly_new_price, plan.monthly_old_price),
                    yearly: priced(plan.yearly_price_id, plan.yearly_new_price, plan.yearly_old_price),
                    lifetime: priced(plan.lifetime_price_id, plan.lifetime_new_price, plan.lifetime_old_price),
                };

                return {
                    id: plan.id,
                    name: plan.name ?? t("untitled"),
                    description: plan.description ?? null,
                    features: lines(plan.features),
                    free,
                    featured: plan.recommended === true,
                    badge: badgeOf(plan),
                    prices,
                    links: Object.fromEntries(durations.map(( duration ) => [
                        duration, base ? `${base}?${new URLSearchParams({ plan: String(plan.id), duration })}` : null,
                    ])) as Record<Duration, string | null>,
                };

            }),
            saving: Math.max(0, ...rows.map(( plan ) => {

                const month = amountOf(plan.monthly_new_price)?.amount ?? 0;
                const year = amountOf(plan.yearly_new_price)?.amount ?? 0;

                return plan.monthly_price_id && plan.yearly_price_id && month > 0 ? Math.round((1 - year / (month * 12)) * 100) : 0;

            })),
        };

    }
    catch {

        return null;

    }

}
