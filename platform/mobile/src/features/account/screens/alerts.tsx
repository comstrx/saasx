import { router } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet } from "react-native-unistyles";
import { Group } from "@/components/group";
import { Loading, Phased, phaseOf } from "@/components/states";
import { AppBar } from "@/elements/app-bar";
import type { IconName } from "@/elements/icon";
import { Stagger } from "@/elements/motion";
import { Row } from "@/elements/row";
import { Screen } from "@/elements/screen";
import { Scroll } from "@/elements/scroll";
import { Sheet } from "@/elements/sheet";
import { Text } from "@/elements/text";
import { Guest, Trouble } from "@/features/shell";
import { retreat } from "@/features/shell/retreat";
import type { NotifyTopic } from "@/model/account";
import { useNotifyPrefs, useSettings } from "@/query/account";
import { useSession } from "@/store/session";
import type { ToneName } from "@/theme/roles";

const topicGlyphs: Readonly<Record<string, IconName>> = {
    creation: "user",
    orders: "orders",
    tracking: "compass",
    finance: "wallet",
    products: "product",
    catalog: "coupon",
    news: "globe",
    marketing: "percent",
    profile: "profile",
    logins: "key",
    chat: "chat",
    support: "support",
    security: "shield",
    system: "settings",
};

const topicTones: Readonly<Record<string, ToneName>> = {
    creation: "brand",
    orders: "info",
    tracking: "accent",
    finance: "success",
    products: "warning",
    catalog: "danger",
    news: "info",
    marketing: "accent",
    profile: "brand",
    logins: "warning",
    chat: "success",
    support: "info",
    security: "danger",
    system: "neutral",
};

const shelves: readonly { key: string; topics: readonly string[] }[] = [
    { key: "bookings", topics: [ "orders", "tracking", "products" ] },
    { key: "money", topics: [ "finance" ] },
    { key: "talk", topics: [ "chat", "support" ] },
    { key: "offers", topics: [ "catalog", "marketing", "news" ] },
    { key: "account", topics: [ "creation", "profile", "logins", "security", "system" ] },
];

const shelved = new Set(shelves.flatMap(( shelf ) => shelf.topics ));

const channelGlyphs: Readonly<Record<string, IconName>> = {
    broadcast: "bell",
    alert: "bell",
    push: "device",
    mail: "mail",
    sms: "messages",
    whatsapp: "phone",
    chat: "chat",
};

export function AlertsScreen () {

    const { t } = useTranslation();
    const token = useSession(( state ) => state.token );
    const settings = useSettings();
    const save = useNotifyPrefs();
    const [ opened, setOpened ] = useState<string | null>(null);

    const topics = ( settings.data?.topics ?? [] ).filter(( item ) => item.forced || item.channels.length > 0 );
    const topic = topics.find(( item ) => item.key === opened ) ?? null;

    const groups = [
        ...shelves.map(( shelf ) => ({ key: shelf.key, topics: topics.filter(( item ) => shelf.topics.includes(item.key) ) })),
        { key: "other", topics: topics.filter(( item ) => !shelved.has(item.key) ) },
    ].filter(( group ) => group.topics.length > 0 );

    const reach = ( item: NotifyTopic ): string => {

        if ( item.forced ) return t("services.required");

        const live = item.channels.filter(( channel ) => channel.on );

        return live.length > 0
            ? live.map(( channel ) => t(`notify.channelShort.${ channel.key }`, channel.key) ).join(" · ")
            : t("notify.silent");

    };

    const row = ( item: NotifyTopic ) => {

        const opens = item.on && item.channels.length > 1 && !item.forced;

        return (
            <Row
                key={item.key}
                icon={topicGlyphs[item.key] ?? "bell"}
                title={t(`notify.topic.${ item.key }`, item.key)}
                note={item.on ? reach(item) : t(`notify.topicBody.${ item.key }`, "")}
                onPress={opens ? () => setOpened(item.key) : undefined}
                toggle={{ on: item.on, disabled: item.forced || save.isPending, onChange: ( next ) => save.mutate({ topic: item.key, on: next }) }}
            />
        );

    };

    if ( !token ) return (
        <Screen edges={[ "top" ]} padded={false}>
            <AppBar title={t("notify.title")} onBack={() => retreat() } />
            <Guest note={t("alerts.guestBody")} onLogin={() => router.push("/login") } />
        </Screen>
    );

    return (
        <Screen edges={[ "top" ]} padded={false}>
            <AppBar title={t("notify.title")} onBack={() => retreat() } />

            <Scroll contentContainerStyle={styles.scroll}>
                <Phased
                    gap="2"
                    phase={phaseOf(settings.isPending && !settings.data, settings.isError && !settings.data, false)}
                    loading={<Loading shape="rows" rows={6} />}
                    failed={<Trouble reason={settings.error} onRetry={() => { void settings.refetch(); }} />}
                >
                    <Stagger>
                        <Text rank="body" ink="soft">{t("notify.note")}</Text>

                        {groups.map(( group ) => <Group key={group.key} title={t(`notify.group.${ group.key }`)}>{group.topics.map(row)}</Group> )}
                    </Stagger>
                </Phased>
            </Scroll>

            <Sheet open={topic !== null} onClose={() => setOpened(null) } title={topic ? t(`notify.topic.${ topic.key }`, topic.key) : ""}>
                {topic ? (
                    <Group>
                        {topic.channels.map(( channel ) => (
                            <Row
                                key={channel.key}
                                plated
                                tone={topic.key in topicTones ? topicTones[topic.key] : "brand"}
                                icon={channelGlyphs[channel.key] ?? "bell"}
                                title={t(`notify.channel.${ channel.key }`, channel.key)}
                                toggle={{ on: channel.on, disabled: save.isPending, onChange: ( next ) => save.mutate({ topic: topic.key, channel: { key: channel.key, on: next } }) }}
                            />
                        ))}
                    </Group>
                ) : null}
            </Sheet>
        </Screen>
    );

}

const styles = StyleSheet.create(( theme ) => ({

    scroll: {
        gap: theme.space["2"],
        paddingHorizontal: theme.layout.gutter,
        paddingTop: theme.space["2"],
    },

}));
