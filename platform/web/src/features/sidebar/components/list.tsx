import { permissionsOf } from "engine/client";
import { menuOf } from "engine/screen";
import { localePath } from "engine/translate";
import SideMenu, { type SideEntry } from "@/components/side-menu";
import { requestLocale } from "@/lib/site/request";
import type { FeatureProps } from "@/lib/spec/feature";
import type { Locale } from "@/lib/spec/languages";
import { routing, screens, text } from "@/lib/spec/server";

export type Options = { title: string };

export default async function List ({ options, screen }: FeatureProps<Options>) {

    const locale = await requestLocale() as Locale;
    const entries: SideEntry[] = menuOf(screens, "sidebar").map(( item ) => ({
        href: localePath(locale, item.path, routing),
        label: text(item.title, locale),
        icon: item.icon,
        current: item.name === screen.name,
        access: permissionsOf(item.access),
    }));

    return <SideMenu label={options.title} entries={entries} />;

}
