import { screenHref } from "@/hooks/use-catalog";
import { getLocale, getTranslations } from "@/lib/providers/intl-server";
import type { Locale } from "@/lib/spec/languages";
import { screens, text } from "@/lib/spec/server";

export async function missing ( links: readonly string[] ) {

    const [locale, t] = await Promise.all([getLocale() as Promise<Locale>, getTranslations("notice")]);

    return {
        title: t("missingTitle"),
        body: t("missingBody"),
        actions: links.flatMap(( name ) => {

            const screen = screens.find(( entry ) => entry.name === name);
            const href = screenHref(screen, locale);

            if ( !screen || !href ) return [];

            return [{ key: name, href, label: text(screen.label ?? screen.title, locale), icon: screen.icon ?? null }];

        }),
    };

}
