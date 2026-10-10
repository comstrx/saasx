import { readContent } from "@/api/workflow/server";
import { getLocale, getTranslations } from "@/lib/providers/intl-server";
import { routing } from "@/lib/spec/config";
import type { Locale } from "@/lib/spec/languages";
import { config, screens, text } from "@/lib/spec/server";
import { localePath } from "@/lib/std/locale";
import { footerParts } from "./use-footer";

type Group = { title: "explore" | "company" | "account" | "support"; links: readonly string[] };
type Pledge = { icon: string; title: "secure" | "support" | "verified" | "flexible" };
export type FooterOptions = { groups: readonly Group[]; promises: readonly Pledge[]; compact: boolean };

export async function footer ( { groups, promises, compact }: FooterOptions ) {

    const [locale, t, content] = await Promise.all([getLocale() as Promise<Locale>, getTranslations("footer"), readContent()]);
    const name = content.name || config.content.name;
    const year = new Intl.DateTimeFormat(`${locale}-u-nu-latn`, { year: "numeric" }).format(new Date());
    const parts = footerParts(content, {
        call: t("call", { name }),
        email: t("email", { name }),
        whatsapp: t("whatsapp"),
        follow: ( network ) => `${t("follow")}: ${network}`,
    });

    const named = groups.map(( group ) => ({
        title: t(`groups.${group.title}`),
        wide: group.links.length > 7,
        links: group.links.flatMap(( name ) => screens.filter(( screen ) => screen.name === name)).map(( screen ) => ({
            href: localePath(locale, screen.path, routing),
            label: text(screen.label ?? screen.title, locale),
            icon: group.title === "explore" ? screen.icon ?? null : null,
            external: false,
        })),
    })).filter(( group ) => group.links.length);

    return {
        brand: {
            href: localePath(locale, "/", routing),
            src: content.logo ?? config.content.logo,
            dark: content.logo_dark ?? config.content.logo_dark,
            alt: content.logo_alt || name,
            width: content.logo_width ?? config.content.logo_width,
            height: content.logo_height ?? config.content.logo_height,
        },
        description: content.description || content.tagline || t("tagline"),
        help: { title: t("helpTitle"), body: t("helpBody") },
        promises: promises.map(( entry ) => ({
            icon: entry.icon, title: t(`promises.${entry.title}.title`), body: t(`promises.${entry.title}.body`),
        })),
        labels: { promises: t("promisesLabel"), groups: t("groupsLabel") },
        contacts: parts.contacts,
        socials: parts.socials,
        groups: [...named, ...parts.groups],
        copyright: `© ${year} ${content.copyright || name}`,
        compact,
    };

}
