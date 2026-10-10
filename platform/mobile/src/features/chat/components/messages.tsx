import { FlashList } from "@shopify/flash-list";
import { type RefObject, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { RefreshControl, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { Alert } from "@/elements/alert";
import { Avatar } from "@/elements/avatar";
import { Badge } from "@/elements/badge";
import { useFloor } from "@/elements/dock/floor";
import { Empty } from "@/elements/empty";
import { Icon, type IconName } from "@/elements/icon";
import { Menu, type MenuItem } from "@/elements/menu";
import { Appear, Greet } from "@/elements/motion";
import { Plate } from "@/elements/plate";
import { Press } from "@/elements/press";
import { usePullSkin } from "@/elements/pull";
import { Screen } from "@/elements/screen";
import { Text } from "@/elements/text";
import { MessagesHead, type RoomKind } from "@/features/chat/components/messages-head";
import { Guest, Trouble } from "@/features/shell";
import { Intro } from "@/features/shell/components/intro";
import { useWhen } from "@/features/shell/hooks/use-when";
import { retreat } from "@/features/shell/retreat";
import { type MessageKind, platform, type Room, type RoomFlag, roomTitle, travelRoom } from "@/model/chat";
import { isolateLtr } from "@/std/bidi";
import { str } from "@/std/str";
import { useTheme } from "@/theme/use-theme";

type ReadState = "any" | "unread" | "read";

type MessagesScreenProps = {
    authenticated: boolean;
    alerts: number;
    rooms: readonly Room[];
    pending: boolean;
    failure?: unknown;
    fetching: boolean;
    onRefresh: () => void;
    onLogin: () => void;
    onOpenRoom: ( room: Room ) => void;
    onDesk: () => void;
    onFlag: ( room: Room, flag: RoomFlag, on: boolean ) => void;
    onRemove: ( room: Room ) => void;
    onAlerts: () => void;
    onNotifications: () => void;
    desk?: string | undefined;
};

type Held = { room: Room; anchor: RefObject<View | null> };

const marks: Partial<Record<MessageKind, IconName>> = {
    image: "image",
    audio: "microphone",
    video: "video",
    file: "attachment",
    location: "location",
    catalog: "orders",
};

const reads = ( room: Room, state: ReadState ): boolean =>
    state === "any" || ( state === "unread" ? room.unread > 0 : room.unread === 0 );

const kinded = ( room: Room, kind: RoomKind ): boolean =>
    kind === "all" || ( kind === "support" ? platform(room) : travelRoom(room) );

const ranked = ( a: Room, b: Room ): number =>
    Number(b.pinned) - Number(a.pinned) || ( b.lastAt ?? "" ).localeCompare(a.lastAt ?? "");

function Face ({ room }: { room: Room }) {

    const theme = useTheme();
    const size = theme.composition.dialog.avatar;

    return (
        <View>
            {platform(room)
                ? <Plate icon="support" size={size} tone="brand" look="solid" />
                : <Avatar name={room.name} source={room.image ?? undefined} size={size} />}

            {room.online ? <View style={styles.online} /> : null}
        </View>
    );

}

function RoomRow ({ room, onPress, onHold }: { room: Room; onPress: () => void; onHold: ( anchor: RefObject<View | null> ) => void }) {

    const { t } = useTranslation();
    const when = useWhen();
    const theme = useTheme();
    const spot = useRef<View>(null);

    const unread = room.unread > 0;
    const label = roomTitle(room, t("chat.support"));
    const mark = marks[room.lastKind];
    const stamp = when.stamp(room.lastAt);

    const preview = ( room.lastOrder ? t("chat.aboutOrder", { id: isolateLtr(`#${ room.lastOrder }`) }) : room.lastLine )
        || ( room.lastKind !== "text" ? t(`chat.kind.${ room.lastKind }`) : "" )
        || ( platform(room) ? t("chat.supportNote") : room.note );

    return (
        <View ref={spot} collapsable={false}>
            <Press
                style={styles.room}
                onPress={onPress}
                onLongPress={() => onHold(spot)}
                delayLongPress={260}
                feel="ripple"
                accessibilityRole="button"
                accessibilityLabel={label}
            >
                <Face room={room} />

                <View style={styles.copy}>
                    <View style={styles.line}>
                        <Text rank="title" numberOfLines={1} style={styles.shrink}>{label}</Text>
                        {room.muted ? <Icon name="muted" size={theme.icon.sm} tint="faint" /> : null}

                        <View style={styles.grow} />

                        {room.lastMine ? <Icon name={room.lastRead ? "checkCircle" : "check"} size={theme.icon.sm} color={theme.tone.brand.onSoft} /> : null}
                        <Text rank="caption" ink="soft">{stamp}</Text>
                    </View>

                    <View style={styles.line}>
                        {mark ? <Icon name={mark} size={theme.icon.sm} tint="faint" /> : null}

                        <Text rank="description" ink="soft" numberOfLines={1} style={styles.grow}>{preview}</Text>

                        {room.pinned && !unread ? <Icon name="pin" size={theme.icon.sm} tint="faint" /> : null}
                        {unread ? <Badge count={room.unread} tint={room.muted ? "neutral" : "brand"} /> : null}
                    </View>
                </View>
            </Press>
        </View>
    );

}

function ArchiveRow ({ open, rooms, onPress }: { open: boolean; rooms: readonly Room[]; onPress: () => void }) {

    const { t } = useTranslation();
    const theme = useTheme();
    const names = rooms.slice(0, 4).map(( room ) => roomTitle(room, t("chat.support")) ).join("، ");
    const waiting = rooms.reduce(( total, room ) => total + ( room.unread > 0 ? 1 : 0 ), 0);

    return (
        <Press style={styles.room} onPress={onPress} feel="ripple" accessibilityRole="button" accessibilityState={{ selected: open }}>
            <Plate icon={open ? "messages" : "archiveBox"} size={theme.composition.dialog.avatar} tone="neutral" look="solid" />

            <View style={styles.copy}>
                <Text rank="title" numberOfLines={1}>{open ? t("chat.allChats") : t("chat.archived")}</Text>

                <View style={styles.line}>
                    <Text rank="description" ink="soft" numberOfLines={1} style={styles.grow}>{open ? t("chat.archivedBody") : names}</Text>
                    {!open && waiting > 0 ? <Badge count={waiting} tint="neutral" /> : null}
                </View>
            </View>
        </Press>
    );

}

const kinds: readonly RoomKind[] = [ "all", "p2p", "support" ];

const greeted = 8;

export function MessagesScreen ( props: MessagesScreenProps ) {

    const { t } = useTranslation();
    const theme = useTheme();
    const skin = usePullSkin();
    const floor = useFloor();
    const more = useRef<View>(null);

    const [ kind, setKind ] = useState<RoomKind>("all");
    const [ state, setState ] = useState<ReadState>("any");
    const [ archived, setArchived ] = useState(false);
    const [ query, setQuery ] = useState("");
    const [ menuing, setMenuing ] = useState(false);
    const [ held, setHeld ] = useState<Held | null>(null);
    const [ doomed, setDoomed ] = useState<Room | null>(null);

    useEffect(() => {

        if ( props.desk ) setKind("support");

    }, [ props.desk ]);

    const inView = useMemo(
        () => props.rooms.filter(( room ) => room.archived === archived ),
        [ archived, props.rooms ],
    );

    const items = useMemo(() =>
        inView
            .filter(( room ) => reads(room, state) )
            .filter(( room ) => kinded(room, kind))
            .filter(( room ) => str.matches(`${ room.name } ${ room.note } ${ room.lastLine }`, query))
            .sort(ranked)
    , [ inView, kind, query, state ]);

    const stored = useMemo(() => props.rooms.filter(( room ) => room.archived ), [ props.rooms ]);
    const roof = stored.length > 0 && query.length === 0;

    const head = ( bare: boolean ) => (
        <MessagesHead
            title={archived ? t("chat.archived") : t("chat.title")}
            kind={kind}
            kinds={kinds}
            query={query}
            bare={bare}
            more={more}
            onBack={archived ? () => setArchived(false) : () => retreat() }
            onKind={setKind}
            onQuery={setQuery}
            onMore={() => setMenuing(true) }
        />
    );

    if ( !props.authenticated ) {

        return (
            <Screen edges={[ "top" ]} padded={false}>
                {head(true)}

                <Guest onLogin={props.onLogin} />
            </Screen>
        );

    }

    const blank = (
        <View style={styles.void}>
            {props.failure
                ? <Trouble reason={props.failure} onRetry={props.onRefresh} />
                : kind === "support" && query.length === 0
                ? <Empty emblem="support" title={t("chat.deskTitle")} note={t("chat.deskBody")} action={t("chat.deskAction")} onAction={props.onDesk} />
                : props.rooms.length === 0
                ? <Empty emblem="chat" title={t("chat.emptyTitle")} note={t("chat.emptyBody")} />
                : query.length > 0
                ? <Empty emblem="search" title={t("chat.noMatches")} note={t("chat.noMatchesBody")} />
                : inView.length === 0 && !archived
                ? <Empty emblem="chat" title={t("chat.storedTitle")} note={t("chat.storedBody")} action={t("chat.archived")} onAction={() => setArchived(true) } />
                : <Empty emblem="chat" title={t("chat.filteredTitle")} note={t("chat.filteredBody")} />}
        </View>
    );

    const filters: readonly MenuItem[] = ( [ "any", "unread", "read" ] as const ).map(( which, index ) => ({
        key: which,
        label: which === "any" ? t("chat.allChats") : t(`chat.state.${ which }`),
        icon: state === which ? "check" : which === "unread" ? "eyeOff" : which === "read" ? "eye" : "messages",
        band: index === 0,
        onPress: () => setState(which),
    }) );

    const overflow: readonly MenuItem[] = [
        { key: "notifications", label: t("chat.notifications"), icon: "bell", onPress: props.onNotifications },
        { key: "archive", label: archived ? t("chat.allChats") : t("chat.archived"), icon: "archiveBox", onPress: () => setArchived(!archived) },
        ...filters,
    ];

    const room = held?.room;

    const actions: readonly MenuItem[] = room ? [
        { key: "pin", label: room.pinned ? t("chat.unpin") : t("chat.pin"), icon: "pin", onPress: () => props.onFlag(room, "pinned", !room.pinned) },
        { key: "mute", label: room.muted ? t("chat.unmute") : t("chat.mute"), icon: "muted", onPress: () => props.onFlag(room, "muted", !room.muted) },
        { key: "archive", label: room.archived ? t("chat.unarchive") : t("chat.archive"), icon: "archiveBox", onPress: () => props.onFlag(room, "archived", !room.archived) },
        { key: "remove", label: t("chat.removeRoom"), icon: "trash", danger: true, band: true, onPress: () => setDoomed(room) },
    ] : [];

    return (
        <Screen edges={[ "top" ]} padded={false}>
            {head(false)}

            <Greet painted={items.length > 0}>
                <FlashList
                    style={styles.feed}
                    data={items}
                    keyExtractor={( entry ) => String(entry.id)}
                    maintainVisibleContentPosition={{ disabled: true }}
                    extraData={`${ roof }:${ items.length }`}
                    renderItem={({ item, index }) => {

                        const row = <RoomRow room={item} onPress={() => props.onOpenRoom(item)} onHold={( anchor ) => setHeld({ room: item, anchor })} />;

                        return (
                            <View style={[ styles.pane, index === 0 && !roof ? styles.top : null, index === items.length - 1 ? styles.bottom : null ]}>
                                {index < greeted ? <Appear from="below" travel={theme.travel.near} delay={Math.min(index, theme.beat.cap) * theme.beat.stagger}>{row}</Appear> : row}
                            </View>
                        );

                    }}
                    ListHeaderComponent={roof ? (
                        <View style={[ styles.pane, styles.top, items.length === 0 ? styles.bottom : null ]}>
                            <ArchiveRow open={archived} rooms={stored} onPress={() => setArchived(!archived) } />
                        </View>
                    ) : null}
                    ListFooterComponent={
                        items.length > 0 ? (
                            <View style={styles.seal}>
                                <Icon name="lock" size={theme.icon.sm} tint="faint" />

                                <Text rank="caption" ink="faint" align="center">
                                    {t("chat.encrypted")}
                                    <Text rank="label" ink="soft">{t("chat.encryptedMark")}</Text>
                                </Text>
                            </View>
                        ) : null
                    }
                    ListEmptyComponent={!props.pending ? blank : null}
                    contentContainerStyle={{ flexGrow: 1, paddingBottom: floor }}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    refreshControl={<RefreshControl refreshing={props.fetching} onRefresh={props.onRefresh} {...skin} />}
                />
            </Greet>

            <Intro
                page="chat"
                emblem="chat"
                tone="info"
                title={t("intro.chat.title")}
                line={t("intro.chat.line")}
                dismiss={t("intro.dismiss")}
                hold={items.length === 0}
            />

            <Menu open={menuing} anchor={more} items={overflow} onClose={() => setMenuing(false) } />

            {held ? <Menu open anchor={held.anchor} items={actions} onClose={() => setHeld(null) } /> : null}

            <Alert
                open={doomed !== null}
                title={t("chat.removeRoom")}
                body={t("chat.removeRoomBody")}
                emblem="trash"
                confirm={t("common.delete")} onConfirm={() => { if ( doomed ) props.onRemove(doomed); setDoomed(null); }} tone="danger"
                cancel={t("common.cancel")}
                onClose={() => setDoomed(null)}
            />
        </Screen>
    );

}

const styles = StyleSheet.create(( theme ) => ({

    feed: {
        flex: 1,
    },
    pane: {
        marginHorizontal: theme.layout.gutter,
        overflow: "hidden",
        backgroundColor: theme.plane.base,
    },
    top: {
        borderTopLeftRadius: theme.radius.card,
        borderTopRightRadius: theme.radius.card,
    },
    bottom: {
        borderBottomLeftRadius: theme.radius.card,
        borderBottomRightRadius: theme.radius.card,
    },
    room: {
        flexDirection: "row",
        alignItems: "center",
        gap: theme.composition.dialog.gap,
        paddingVertical: theme.composition.dialog.padY,
        paddingHorizontal: theme.layout.gutter,
    },
    online: {
        position: "absolute",
        insetInlineEnd: 0,
        bottom: 0,
        width: theme.composition.dialog.dot,
        height: theme.composition.dialog.dot,
        borderRadius: theme.radius.pill,
        borderWidth: theme.stroke.base,
        borderColor: theme.plane.base,
        backgroundColor: theme.tone.success.bright,
    },
    copy: {
        flex: 1,
        gap: theme.space["1"],
    },
    line: {
        flexDirection: "row",
        alignItems: "center",
        gap: theme.space["1.5"],
    },
    grow: {
        flex: 1,
    },
    shrink: {
        flexShrink: 1,
    },
    void: {
        flexGrow: 1,
        justifyContent: "center",
        paddingBottom: theme.space["3"],
        paddingHorizontal: theme.layout.gutter,
    },
    seal: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: theme.space["2"],
        paddingTop: theme.space["4"],
        paddingHorizontal: theme.layout.gutter,
    },

}));
