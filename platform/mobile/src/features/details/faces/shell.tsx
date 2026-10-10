import type { ReactNode } from "react";
import { View } from "react-native";
import { Panel } from "@/components/panel";
import { Divider } from "@/elements/divider";
import { Icon, type IconName } from "@/elements/icon";
import { Text } from "@/elements/text";
import type { ToneName } from "@/theme/roles";
import { useTheme } from "@/theme/use-theme";

type DeckCardProps = {
    title?: string | undefined;
    note?: string | undefined;
    children: ReactNode;
    foot?: ReactNode | undefined;
    picked?: boolean | undefined;
};

export function DeckCard ({ title, note, children, foot, picked = false }: DeckCardProps) {

    return <Panel title={title} note={note} footer={foot} picked={picked}>{children}</Panel>;

}

export function DeckStack ({ children }: { children: ReactNode }) {

    const theme = useTheme();

    return (
        <View style={{ paddingHorizontal: theme.layout.gutter }}>
            <Divider />
            <View style={{ paddingVertical: theme.space["6"], gap: theme.space["6"] }}>{children}</View>
        </View>
    );

}

export type Pledge = {
    key: string;
    icon: IconName;
    title: string;
    note: string;
    tint?: ToneName | undefined;
};

export function DeckPromises ({ items }: { items: readonly Pledge[] }) {

    const theme = useTheme();

    return (
        <View style={{ gap: theme.space["5"], paddingBottom: theme.space["1"] }}>
            {items.map(( item ) => (
                <View key={item.key} style={{ flexDirection: "row", alignItems: "flex-start", gap: theme.space["4"] }}>
                    <Icon name={item.icon} size={theme.icon.xl} color={item.tint ? theme.tone[item.tint].onSoft : theme.ink.strong} />

                    <View style={{ flex: 1, gap: theme.space["1"] }}>
                        <Text rank="label">{item.title}</Text>
                        <Text rank="caption" ink="soft">{item.note}</Text>
                    </View>
                </View>
            ))}

            <Divider />
        </View>
    );

}

type DeckSplitProps = {
    lead: { label: string; value: string; note?: string | undefined };
    tail: { label: string; value: string; note?: string | undefined };
};

export function DeckSplit ({ lead, tail }: DeckSplitProps) {

    const theme = useTheme();

    return (
        <View style={{ flexDirection: "row", alignItems: "stretch" }}>
            <View style={{ flex: 1, gap: theme.space["1"] }}>
                <Text rank="caption" ink="soft">{lead.label}</Text>
                <Text rank="display" ltr numberOfLines={1}>{lead.value}</Text>
                {lead.note ? <Text rank="note" ink="faint" numberOfLines={1}>{lead.note}</Text> : null}
            </View>

            <Divider vertical inset="1" />

            <View style={{ flex: 1, gap: theme.space["1"], paddingInlineStart: theme.space["4"] }}>
                <Text rank="caption" ink="soft">{tail.label}</Text>
                <Text rank="display" ltr numberOfLines={1}>{tail.value}</Text>
                {tail.note ? <Text rank="note" ink="faint" numberOfLines={1}>{tail.note}</Text> : null}
            </View>
        </View>
    );

}
