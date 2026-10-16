import { permissionsOf } from "engine/client";
import { menuOf } from "engine/screen";
import TabMenu, { type TabEntry } from "@/components/tab-menu";
import { useLocale } from "@/hooks/use-locale";
import type { FeatureProps } from "@/lib/spec/feature";
import { screens, text } from "@/lib/spec/runtime";

export type Options = { label: string };

export default function Bar ({ options, screen }: FeatureProps<Options>) {

    const locale = useLocale();
    const entries: TabEntry[] = menuOf(screens, "tabs").map(( item ) => ({
        name: item.name,
        path: item.path,
        label: text(item.title, locale),
        icon: item.icon,
        current: item.name === screen.name,
        access: permissionsOf(item.access),
    }));

    return <TabMenu label={options.label} entries={entries} />;

}
