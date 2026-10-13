import { menuOf } from "@engine/spec";
import TabMenu, { type TabEntry } from "@/components/tab-menu";
import { useLocale } from "@/hooks/use-locale";
import type { FeatureProps } from "@/lib/spec/feature";
import { screens, text } from "@/lib/spec/runtime";

export type Options = { label: string };

function accessOf ( access: string | readonly string[] ): readonly string[] {

    if ( Array.isArray(access) ) return access;

    return access === "user" ? ["user"] : [];

}
export default function Bar ({ options, screen }: FeatureProps<Options>) {

    const locale = useLocale();
    const entries: TabEntry[] = menuOf(screens, "tabs").map(( item ) => ({
        name: item.name,
        path: item.path,
        label: text(item.title, locale),
        icon: item.icon,
        current: item.name === screen.name,
        access: accessOf(item.access),
    }));

    return <TabMenu label={options.label} entries={entries} />;

}
