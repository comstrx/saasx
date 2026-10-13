"use client";

import { granted } from "@engine/spec";
import Menu, { type MenuEntry } from "@/elements/menu";
import { useSession } from "@/hooks/use-session";
import Icon from "@/icons";

export type SideEntry = Omit<MenuEntry, "icon"> & { icon?: string | null | undefined; access: readonly string[] };
type Props = { label: string; entries: readonly SideEntry[] };

export default function SideMenu ({ label, entries }: Props) {

    const { ready, user } = useSession();
    const shown = entries
        .filter(( entry ) => entry.access.length === 0 || (ready && granted(user, entry.access)))
        .map(( entry ) => ({ ...entry, icon: entry.icon ? <Icon name={entry.icon} size="sm" /> : undefined }));

    return <Menu label={label} entries={shown} />;

}
