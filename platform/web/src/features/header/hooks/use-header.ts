import { screenHref, verticals } from "@/hooks/use-catalog";
import { getLocale, getTranslations } from "@/lib/providers/intl-server";
import { routing } from "@/lib/spec/config";
import type { Locale } from "@/lib/spec/languages";
import { screenAt, text } from "@/lib/spec/server";
import { localePath } from "@/lib/std/locale";

type Action = { label: string; path: string; icon: string | null };

export async function headerActions ( actions: readonly Action[] ) {

    const locale = await getLocale();

    return actions
        .filter(( action ) => screenAt(action.path.split("/").filter(Boolean)))
        .map(( action ) => ({
            label: action.label,
            href: localePath(locale, action.path, routing),
            icon: action.icon,
        }));

}
export async function headerVerticals ( current: string ) {

    const [locale, t] = await Promise.all([getLocale() as Promise<Locale>, getTranslations("header")]);
    const items = verticals()
        .map(( item ) => ({
            href: screenHref(item.screen, locale) ?? "/",
            label: text(item.screen.title, locale),
            icon: item.screen.icon ?? null,
            current: item.screen.name === current,
        }));

    return { label: t("verticals"), items };

}
export async function headerTrust () {

    const t = await getTranslations("header");

    return { badge: t("badge"), trust: [t("trust.prices"), t("trust.payments"), t("trust.support")] };

}
