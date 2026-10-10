import { router } from "expo-router";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { Group } from "@/components/group";
import { Loading } from "@/components/states";
import { Alert as Confirm } from "@/elements/alert";
import { AppBar } from "@/elements/app-bar";
import { Empty } from "@/elements/empty";
import { Icon, type IconName } from "@/elements/icon";
import { Plate } from "@/elements/plate";
import { Press } from "@/elements/press";
import { Round } from "@/elements/round";
import { Row } from "@/elements/row";
import { Screen } from "@/elements/screen";
import { Sheet } from "@/elements/sheet";
import { Tabs } from "@/elements/tabs";
import { Text } from "@/elements/text";
import { Feed, Filtered, Guest } from "@/features/shell";
import { Intro } from "@/features/shell/components/intro";
import { useWhen } from "@/features/shell/hooks/use-when";
import { retreat } from "@/features/shell/retreat";
import { type Alert, alertFamily, alertGroups, alertTone } from "@/model/notification";
import { useAlerts, useDropAlert, useMarkAlert } from "@/query/notifications";
import { itemsOf } from "@/query/shelf";
import { notify } from "@/store/notice";
import { useSession } from "@/store/session";
import { useTheme } from "@/theme/use-theme";

const glyphs: Record<string, IconName> = {
    order_paid: "card",
    order_confirmed: "checkCircle",
    order_completed: "checkCircle",
    order_cancelled: "xCircle",
    order_refunded: "refresh",
    order_scheduled: "clock",
    order_provider_booked: "verified",
    wallet_deposit: "wallet",
    wallet_withdraw: "wallet",
    wallet_withdraw_alert: "alert",
    wallet_transfer: "share",
    ticket_closed: "checkCircle",
    ticket_resolved: "checkCircle",
    identity_approved: "verified",
    level_up: "award",
    report_filed: "alert",
    review_posted: "star",
    order: "orders",
    payment: "card",
    transaction: "card",
    wallet: "wallet",
    refund: "refresh",
    chat: "chat",
    message: "chat",
    room: "chat",
    ticket: "support",
    offer: "gift",
    coupon: "coupon",
    news: "info",
    level: "award",
    referral: "invite",
    auth: "shield",
    session: "device",
    profile: "account",
    account: "account",
    identity: "verified",
    system: "info",
};

const familyGlyphs: Readonly<Record<string, IconName>> = {
    order: "orders",
    wallet: "wallet",
    auth: "shield",
    level: "level",
    news: "globe",
    chat: "chat",
    identity: "verified",
    referral: "invite",
    system: "settings",
};

export function NotificationsScreen () {

    const { t } = useTranslation();
    const when = useWhen();
    const theme = useTheme();
    const token = useSession(( state ) => state.token );

    const [ family, setFamily ] = useState("all");
    const [ held, setHeld ] = useState<Alert | null>(null);
    const [ wiping, setWiping ] = useState(false);

    const board = useAlerts();
    const kinds = board.data?.pages[0]?.kinds ?? {};
    const groups = useMemo(() => alertGroups(kinds), [ kinds ]);

    const picked = useMemo(
        () => groups.find(( group ) => group.family === family )?.kinds ?? [],
        [ family, groups ],
    );

    const shown = useAlerts(picked);
    const feed = family === "all" ? board : shown;

    const mark = useMarkAlert();
    const drop = useDropAlert();

    const stamp = when.stamp;
    const items = itemsOf(feed.data);

    const ordered = useMemo(() => [
        ...items.filter(( item ) => item.pinned ),
        ...items.filter(( item ) => !item.pinned ),
    ], [ items ]);

    const tabs = useMemo(() => [
        { key: "all", label: t("alerts.all"), icon: "bell" as const },
        ...groups.map(( group ) => ({
            key: group.family,
            label: t(`alerts.family.${ group.family }`, { defaultValue: group.family }),
            icon: familyGlyphs[group.family] ?? "bell",
        })),
    ], [ groups, t ]);

    const act = ( action: "read" | "unread" | "pin" | "unpin" ) => {

        if ( held ) mark.mutate({ id: held.id, action });

        setHeld(null);

    };

    const remove = () => {

        if ( held ) drop.mutate(held.id, { onSuccess: () => notify(t("alerts.dropped"), "success") });

        setHeld(null);

    };

    const card = ( alert: Alert ) => {

        const kin = alertFamily(alert.kind);
        const glyph = glyphs[alert.kind] ?? glyphs[kin] ?? "bell";

        return (
            <Press
                key={alert.id}
                style={[ styles.card, !alert.read && styles.fresh ]}
                onPress={() => alert.read ? setHeld(alert) : mark.mutate({ id: alert.id, action: "read" }) }
                onLongPress={() => setHeld(alert) }
                delayLongPress={260}
                sink="tile"
                accessibilityRole="button"
                accessibilityLabel={alert.title}
            >
                <Plate icon={glyph} tone={alertTone(alert.kind)} size={theme.control.md.height} />

                <View style={styles.copy}>
                    <View style={styles.line}>
                        <Text rank="label" numberOfLines={1} style={styles.grow}>
                            {alert.title}
                        </Text>

                        {alert.pinned ? <Icon name="pin" size={theme.icon.sm} tint="brand" /> : null}

                        <Text rank="note" ink="faint">{stamp(alert.at)}</Text>

                        {!alert.read ? <View style={styles.dot} /> : null}
                    </View>

                    <Text rank="caption" ink="soft" numberOfLines={2}>{alert.body}</Text>
                </View>
            </Press>
        );

    };

    const readAll = () => {

        const fresh = items.filter(( alert ) => !alert.read ).map(( alert ) => alert.id ).slice(0, 100);

        if ( fresh.length > 0 ) mark.mutate({ ids: fresh, action: "read" });

    };

    return (
        <Screen edges={[ "top" ]} padded={false}>
            <AppBar
                title={t("alerts.title")}
                onBack={() => retreat() }
                actions={token && items.length > 0 ? (
                    <>
                        <Round icon="checkCircle" label={t("alerts.readAll")} onPress={readAll} />
                        <Round icon="trash" look="soft" tone="danger" label={t("alerts.clear")} onPress={() => setWiping(true) } />
                    </>
                ) : undefined}
            >
                {token && groups.length > 1 ? <Tabs options={tabs} active={family} onPick={setFamily} /> : null}
            </AppBar>

            {token ? (
                <Feed
                    key={family}
                    list={feed}
                    items={ordered}
                    keyOf={( alert ) => String(alert.id) }
                    render={card}

                    loading={<Loading shape="rows" rows={5} />}
                    empty={family === "all" ? <Empty emblem="bell" title={t("alerts.emptyTitle")} note={t("alerts.emptyBody")} /> : <Filtered emblem="bell" filter={tabs.find(( tab ) => tab.key === family )?.label ?? family} all={t("alerts.all")} />}
                />
            ) : <Guest note={t("alerts.guestBody")} onLogin={() => router.push("/login")} />}

            <Intro
                page="alerts"
                emblem="bell"
                tone="warning"
                title={t("intro.alerts.title")}
                line={t("intro.alerts.line")}
                action={t("intro.alerts.action")}
                dismiss={t("intro.dismiss")}
                hold={!token}
                onAction={() => router.push("/notify") }
            />

            <Sheet open={held !== null} onClose={() => setHeld(null) } title={held?.title ?? ""}>
                <Group>
                    <Row
                        key="read"
                        icon={held?.read ? "eyeOff" : "checkCircle"}
                        title={t(held?.read ? "alerts.markUnread" : "alerts.markRead")}
                        plated
                        onPress={() => act(held?.read ? "unread" : "read") }
                    />

                    <Row key="pin" icon="pin" title={t(held?.pinned ? "alerts.unpin" : "alerts.pin")} plated onPress={() => act(held?.pinned ? "unpin" : "pin") } />

                    <Row key="drop" icon="trash" title={t("alerts.drop")} tint="danger" plated onPress={remove} />
                </Group>
            </Sheet>

            <Confirm
                open={wiping}
                title={t("alerts.clear")}
                body={t("alerts.clearBody")}
                emblem="trash"
                confirm={t("common.delete")} onConfirm={() => {

                    setWiping(false);

                    const loaded = items.map(( alert ) => alert.id ).slice(0, 100);

                    if ( loaded.length > 0 ) drop.mutate(loaded, { onSuccess: () => notify(t("alerts.cleared"), "success") });

                }} tone="danger"
                cancel={t("common.cancel")}
                onClose={() => setWiping(false) }
            />
        </Screen>
    );

}

const styles = StyleSheet.create(( theme ) => ({

    card: {
        ...theme.card,
        overflow: "hidden",
        flexDirection: "row",
        alignItems: "flex-start",
        gap: theme.space["4"],
        padding: theme.space["4"],
    },
    fresh: {
        backgroundColor: theme.plane[theme.name === "dark" ? "raised" : "base"],
    },
    copy: {
        flex: 1,
        minWidth: 0,
        gap: theme.space["1"],
    },
    line: {
        flexDirection: "row",
        alignItems: "center",
        gap: theme.space["2"],
    },
    grow: {
        flex: 1,
        minWidth: 0,
    },
    dot: {
        width: theme.space["2"],
        height: theme.space["2"],
        borderRadius: theme.radius.pill,
        backgroundColor: theme.tone.brand.base,
    },

}));
