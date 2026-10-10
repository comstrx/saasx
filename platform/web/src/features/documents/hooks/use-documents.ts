import { read, readContent } from "@/api/workflow/server";
import { getLocale, getTranslations } from "@/lib/providers/intl-server";
import { routing } from "@/lib/spec/config";
import { screens } from "@/lib/spec/server";
import { day } from "@/lib/std/format";
import { localePath } from "@/lib/std/locale";
import { clauses } from "@/lib/std/text";

export async function documentPage ( page: string ) {

    const [locale, t] = await Promise.all([getLocale(), getTranslations("documents")]);
    const home = localePath(locale, "/", routing);

    try {

        const result = await read("documents", "read", { documentKey: page });
        const entry = result.resource.find(( row ) => row.key === page || row.page === page) ?? result.resource[0];

        if ( !entry?.content ) throw new Error("empty");

        return {
            failed: false as const,
            content: entry.content,
            clauses: clauses(entry.content),
            updated: entry.updated_at ? t("updated", { date: day(entry.updated_at, locale) }) : null,
            labels: { index: t("index") },
        };

    }
    catch {

        return {
            failed: true as const,
            empty: {
                art: "/assets/images/brand/document.webp",
                title: t("emptyTitle"),
                description: t("emptyBody"),
                clear: { href: home, label: t("home") },
            },
        };

    }

}
export async function contactPage () {

    const [content, t] = await Promise.all([readContent(), getTranslations("reach")]);
    const support = screens.find(( screen ) => screen.name === "support");
    const locale = await getLocale();
    const digits = ( value: string ) => value.replace(/[^\d]/g, "");
    const channels = [
        content.phone ? {
            key: "phone", icon: "phone", title: t("call"), detail: content.phone, href: `tel:+${digits(content.phone)}`,
        } : null,
        content.email ? { key: "email", icon: "mail", title: t("email"), detail: content.email, href: `mailto:${content.email}` } : null,
        content.whatsapp ? {
            key: "whatsapp",
            icon: "whatsapp",
            title: t("whatsapp"),
            detail: content.whatsapp,
            href: `https://wa.me/${digits(content.whatsapp)}`,
        } : null,
    ].filter(( item ) => item !== null);

    return {
        channels,
        support: support ? { href: localePath(locale, support.path, routing), label: t("ticket") } : null,
        hours: t("hours"),
        promise: t("promise"),
    };

}
