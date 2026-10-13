import { granted } from "@engine/spec";
import { useRouter } from "expo-router";
import TabBar from "@/elements/tab-bar";
import { useSession } from "@/hooks/use-session";
import Icon from "@/icons";

export type TabEntry = { name: string; path: string; label: string; icon?: string | null | undefined; current: boolean; access: readonly string[] };
type Props = { label: string; entries: readonly TabEntry[] };

export default function TabMenu ({ label, entries }: Props) {

    const router = useRouter();
    const { ready, user } = useSession();
    const tabs = entries
        .filter(( entry ) => entry.access.length === 0 || (ready && granted(user, entry.access)))
        .map(( entry ) => ({
            key: entry.name,
            label: entry.label,
            icon: entry.icon ? <Icon name={entry.icon} size="md" tone={entry.current ? "primary" : "muted"} /> : undefined,
            current: entry.current,
            onPress: () => router.navigate(entry.path as never),
        }));

    if ( tabs.length < 2 ) return null;

    return <TabBar label={label} tabs={tabs} />;

}
