import { menuOf } from "@engine/spec";
import { localePath } from "@engine/translate";
import SideMenu, { type SideEntry } from "@/components/side-menu";
import { requestLocale } from "@/lib/site/request";
import type { FeatureProps } from "@/lib/spec/feature";
import type { Locale } from "@/lib/spec/languages";
import { routing, screens, text } from "@/lib/spec/server";

export type Options = { title: string };

function accessOf ( access: string | readonly string[] ): readonly string[] {
    if ( Array.isArray(access) ) return access;

    return access === "user" ? ["user"] : [];
}
export default async function List ({ options, screen }: FeatureProps<Options>) {
    const locale = await requestLocale() as Locale;
    const entries: SideEntry[] = menuOf(screens, "sidebar").map(( item ) => ({
        href: localePath(locale, item.path, routing),
        label: text(item.title, locale),
        icon: item.icon,
        current: item.name === screen.name,
        access: accessOf(item.access),
    }));

    return <SideMenu label={options.title} entries={entries} />;
}
