import { getLocale, getTranslations } from "@/lib/providers/intl-server";
import { routing } from "@/lib/spec/config";
import type { Locale } from "@/lib/spec/languages";
import { screens, text } from "@/lib/spec/server";
import { localePath } from "@/lib/std/locale";

export type MenuOptions = {
    account: readonly string[];
    activity: readonly string[];
    money: readonly string[];
    help: readonly string[];
    current: string;
};

const groups = ["account", "activity", "money", "help"] as const;

export async function accountMenu ( options: MenuOptions ) {

    const [locale, t] = await Promise.all([getLocale() as Promise<Locale>, getTranslations("menu")]);

    return {
        label: t("label"),
        labels: { verified: t("verified"), signOut: t("signOut") },
        groups: groups.flatMap(( group ) => {

            const items = options[group].flatMap(( name ) => screens.filter(( screen ) => screen.name === name)).map(( screen ) => ({
                href: localePath(locale, screen.path, routing),
                label: text(screen.label ?? screen.title, locale),
                icon: screen.icon ?? "dots",
                current: screen.name === options.current,
            }));

            return items.length ? [{ key: group, title: t(`groups.${group}`), items }] : [];

        }),
    };

}
