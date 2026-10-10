import { Image } from "expo-image";
import { type ReactNode, useContext, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Linking, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { Group } from "@/components/group";
import { Loading } from "@/components/states";
import { Viewer } from "@/components/viewer";
import { AppBar } from "@/elements/app-bar";
import { Avatar } from "@/elements/avatar";
import { Empty } from "@/elements/empty";
import { Fullscreen } from "@/elements/fullscreen";
import { Icon, type IconName } from "@/elements/icon";
import { Menu, type MenuItem } from "@/elements/menu";
import { Plate } from "@/elements/plate";
import { Press } from "@/elements/press";
import { Round } from "@/elements/round";
import { Row, Seam } from "@/elements/row";
import { Screen } from "@/elements/screen";
import { Scroll } from "@/elements/scroll";
import { Tabs } from "@/elements/tabs";
import { Text } from "@/elements/text";
import { Trouble } from "@/features/shell";
import { useWhen } from "@/features/shell/hooks/use-when";
import { type ChatAttachment, type ChatLink, kindGlyph, linkHost, type Message, platform, type Room, type RoomFlag, viewable } from "@/model/chat";
import { useTheme } from "@/theme/use-theme";

type ChatInfoScreenProps = {
    room: Room | null;
    media: readonly ChatAttachment[];
    links: readonly ChatLink[];
    starred: readonly Message[];
    pending?: boolean;
    failure?: unknown;
    onRetry?: (() => void) | undefined;
    onBack: () => void;
    onFlag: ( flag: RoomFlag, on: boolean ) => void;
    onBlock: () => void;
    onReport: () => void;
    onRemove: () => void;
};

type Shelf = "media" | "files" | "links";

const shelfOrder: readonly Shelf[] = [ "media", "files", "links" ];

function Act ({ icon, label, onPress }: { icon: IconName; label: string; onPress: () => void }) {

    const theme = useTheme();

    return (
        <Press onPress={onPress} feel="ripple" accessibilityRole="button" accessibilityLabel={label} style={styles.act}>
            <Icon name={icon} size={theme.icon.lg} color={theme.ink.strong} fill={theme.name === "dark"} />
            <Text rank="micro" ink="strong" align="center" numberOfLines={1}>{label}</Text>
        </Press>
    );

}

type SharedProps = {
    sign: ReactNode;
    title: string;
    note?: string | undefined;
    link?: boolean | undefined;
    onPress?: (() => void) | undefined;
};

function Shared ({ sign, title, note, link = false, onPress }: SharedProps) {

    const theme = useTheme();
    const seamed = useContext(Seam);

    return (
        <Press feel="ripple" muted={1} onPress={onPress} disabled={!onPress} accessibilityRole={link ? "link" : "none"} accessibilityLabel={title}>
            <View style={styles.shared}>
                {seamed ? <View pointerEvents="none" style={styles.seam} /> : null}

                {sign}

                <View style={styles.grow}>
                    <Text rank="body" ink="strong" numberOfLines={1} ltr={link}>{title}</Text>
                    {note ? <Text rank="caption" ink={link ? undefined : "soft"} color={link ? theme.tone.brand.onSoft : undefined} numberOfLines={1} ltr={link}>{note}</Text> : null}
                </View>
            </View>
        </Press>
    );

}

export function ChatInfoScreen ( props: ChatInfoScreenProps ) {

    const { t } = useTranslation();
    const theme = useTheme();
    const when = useWhen();
    const more = useRef<View>(null);

    const [ shelf, setShelf ] = useState<Shelf>("media");
    const [ viewing, setViewing ] = useState<string | null>(null);
    const [ starOpen, setStarOpen ] = useState(false);
    const [ menuing, setMenuing ] = useState(false);
    const [ past, setPast ] = useState(false);

    const room = props.room;
    const desk = room ? platform(room) : false;
    const name = room ? ( desk ? t("chat.support") : room.name ) : "";
    const profile = theme.composition.profile;

    const shots = props.media.filter(viewable);
    const files = props.media.filter(( item ) => !viewable(item) );

    const stock: Readonly<Record<Shelf, number>> = { media: shots.length, files: files.length, links: props.links.length };
    const titles: Readonly<Record<Shelf, string>> = { media: t("chat.tabMedia"), files: t("chat.tabFiles"), links: t("chat.tabLinks") };
    const shelves = shelfOrder.filter(( key ) => stock[key] > 0 ).map(( key ) => ({ key, label: titles[key] }) );
    const shown = shelves.some(( item ) => item.key === shelf ) ? shelf : shelves[0]?.key;

    const pages = shots.map(( item ) => ({ id: String(item.id), url: item.url, video: item.kind === "video" }) );

    const status = room?.online
        ? t("chat.online")
        : room?.lastSeenAt
            ? t("chat.lastSeen", { value: when.stamp(room.lastSeenAt) })
            : t("chat.offline");

    const fold = profile.top + theme.art.md + theme.space["3"] - ( theme.control.bar.height + theme.space["1.5"] + theme.space["3"] );

    const overflow: readonly MenuItem[] = [
        ...( desk ? [] : [ { key: "report", label: t("chat.report"), icon: "warning" as const, onPress: props.onReport } ] ),
        { key: "remove", label: t("chat.removeRoom"), icon: "trash", danger: true, band: !desk, onPress: props.onRemove },
    ];

    if ( props.failure || ( !room && !props.pending ) ) {

        return (
            <Screen edges={[ "top" ]} padded={false}>
                <AppBar onBack={props.onBack} />
                <Trouble reason={props.failure} onRetry={props.onRetry} />
            </Screen>
        );

    }

    if ( props.pending ) {

        return (
            <Screen edges={[ "top" ]} padded={false}>
                <AppBar onBack={props.onBack} />
                <View style={styles.inset}><Loading shape="rows" rows={6} /></View>
            </Screen>
        );

    }

    return (
        <Screen edges={[]} padded={false}>
            <Scroll mark={fold} onMark={setPast} contentContainerStyle={styles.body}>
                <View style={styles.hero}>
                    {desk
                        ? <Plate icon="support" size={theme.art.md} look="solid" />
                        : <Avatar name={room?.name} source={room?.image ?? undefined} size={theme.art.md} />}

                    <View style={styles.heroCopy}>
                        <Text rank="display" align="center" numberOfLines={1}>{name}</Text>
                        <Text rank="body" ink={room?.online ? undefined : "soft"} color={room?.online ? theme.tone.brand.onSoft : undefined} align="center" numberOfLines={1}>
                            {status}
                        </Text>
                    </View>
                </View>

                <View style={styles.acts}>
                    <Act icon="chat" label={t("chat.act.message")} onPress={props.onBack} />
                    <Act icon={room?.muted ? "bellSlash" : "bell"} label={room?.muted ? t("chat.act.unmute") : t("chat.act.mute")} onPress={() => props.onFlag("muted", !room?.muted)} />
                    <Act icon="archiveBox" label={room?.archived ? t("chat.act.unarchive") : t("chat.act.archive")} onPress={() => props.onFlag("archived", !room?.archived)} />
                    {desk
                        ? <Act icon="warning" label={t("chat.act.report")} onPress={props.onReport} />
                        : <Act icon="prohibit" label={room?.blocked ? t("chat.act.unblock") : t("chat.act.block")} onPress={room?.blocked ? () => props.onFlag("blocked", false) : props.onBlock} />}
                </View>

                <View style={styles.cards}>
                    {room?.note ? (
                        <Group>
                            <Row key="about" title={room.note} note={t("chat.about")} />
                        </Group>
                    ) : null}

                    <Group note={t("chat.secureBody")}>
                        <Row key="starred" icon="star" title={t("chat.starred")} value={String(props.starred.length)} onPress={() => setStarOpen(true)} />
                    </Group>

                    {shown ? (
                        <View style={styles.shelf}>
                            <View style={styles.switch}>
                                <Tabs look="capsule" options={shelves} active={shown} onPick={setShelf} />
                            </View>

                            <Group>
                                {shown === "media" ? (
                                    <View key="media" style={styles.grid}>
                                        {shots.map(( item ) => (
                                            <Press
                                                key={item.id}
                                                style={styles.tile}
                                                onPress={() => setViewing(String(item.id))}
                                                feel="dim"
                                                accessibilityRole="imagebutton"
                                                accessibilityLabel={item.name || t(`chat.kind.${ item.kind }`)}
                                            >
                                                <Image source={item.url} style={styles.shot} contentFit="cover" transition={160} />

                                                {item.kind === "video" ? (
                                                    <View style={styles.play}>
                                                        <Icon name="play" size={theme.icon.md} tint="inverse" />
                                                    </View>
                                                ) : null}
                                            </Press>
                                        ))}
                                    </View>
                                ) : null}

                                {shown === "files" ? files.map(( item ) => (
                                    <Shared
                                        key={item.id}
                                        sign={<View style={[ styles.sign, styles.document ]}><Icon name={kindGlyph(item.kind)} size={theme.icon.lg} tint="lit" /></View>}
                                        title={item.name || t(`chat.kind.${ item.kind }`)}
                                        note={item.size}
                                    />
                                )) : null}

                                {shown === "links" ? props.links.map(( item ) => (
                                    <Shared
                                        key={item.id}
                                        link
                                        sign={<View style={[ styles.sign, styles.site ]}><Text rank="display" ink="soft">{linkHost(item.url).charAt(0).toUpperCase()}</Text></View>}
                                        title={linkHost(item.url)}
                                        note={item.url}
                                        onPress={() => void Linking.openURL(item.url)}
                                    />
                                )) : null}
                            </Group>
                        </View>
                    ) : null}
                </View>
            </Scroll>

            <AppBar
                floating
                revealed={past}
                title={name}
                onBack={props.onBack}
                actions={(
                    <View ref={more} collapsable={false}>
                        <Round icon="more" onPress={() => setMenuing(true) } label={t("common.more")} />
                    </View>
                )}
            />

            <Menu open={menuing} anchor={more} items={overflow} onClose={() => setMenuing(false) } />

            <Fullscreen open={starOpen} title={t("chat.starred")} onClose={() => setStarOpen(false)}>
                {props.starred.length
                    ? (
                        <View style={styles.rows}>
                            {props.starred.map(( message ) => (
                                <View key={message.id} style={styles.note}>
                                    <View style={styles.noteHead}>
                                        <Text rank="label" tint="brand" numberOfLines={1} style={styles.grow}>
                                            {message.mine ? t("chat.you") : message.sender}
                                        </Text>
                                        <Text rank="micro" ink="faint">{when.clock(message.at)}</Text>
                                    </View>

                                    <Text rank="body" numberOfLines={4}>
                                        {message.body || t(`chat.kind.${ message.kind }`)}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    )
                    : <Empty emblem="chat" title={t("chat.starredEmpty")} note={t("chat.starredEmptyBody")} />}
            </Fullscreen>

            <Viewer
                open={Boolean(viewing)}
                items={pages}
                start={Math.max(0, pages.findIndex(( item ) => item.id === viewing ))}
                onClose={() => setViewing(null)}
            />
        </Screen>
    );

}

const styles = StyleSheet.create(( theme, runtime ) => ({

    inset: {
        paddingHorizontal: theme.layout.gutter,
    },
    grow: {
        flex: 1,
    },
    body: {
        paddingTop: runtime.insets.top + theme.composition.profile.top,
        paddingHorizontal: theme.layout.gutter,
        paddingBottom: runtime.insets.bottom + theme.space["9"],
    },
    hero: {
        alignItems: "center",
        gap: theme.space["3"],
    },
    heroCopy: {
        alignSelf: "stretch",
        paddingHorizontal: theme.space["4"],
    },
    acts: {
        flexDirection: "row",
        gap: theme.composition.profile.actGap,
        marginTop: theme.composition.profile.acts,
    },
    act: {
        flex: 1,
        height: theme.composition.profile.act,
        alignItems: "center",
        justifyContent: "center",
        gap: theme.space["0"],
        paddingHorizontal: theme.space["1"],
        overflow: "hidden",
        borderRadius: theme.radius.card,
        backgroundColor: theme.plane.groove,
    },
    cards: {
        gap: theme.composition.profile.gap,
        marginTop: theme.composition.profile.after,
    },
    shelf: {
        gap: theme.composition.profile.gap,
    },
    switch: {
        alignItems: "center",
    },
    grid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: theme.composition.profile.grid,
    },
    tile: {
        width: ( runtime.screen.width - theme.layout.gutter * 2 - theme.composition.profile.grid * 2 ) / 3,
        aspectRatio: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: theme.plane.well,
    },
    shot: {
        width: "100%",
        height: "100%",
    },
    play: {
        position: "absolute",
        width: theme.control.sm.height,
        height: theme.control.sm.height,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: theme.radius.pill,
        backgroundColor: theme.photo.chip,
    },
    shared: {
        flexDirection: "row",
        alignItems: "center",
        gap: theme.space["3"],
        padding: theme.space["2.5"],
    },
    seam: {
        position: "absolute",
        top: 0,
        insetInlineStart: theme.space["2.5"] + theme.composition.profile.sign + theme.space["3"],
        insetInlineEnd: 0,
        height: theme.stroke.hair,
        backgroundColor: theme.line.hair,
    },
    sign: {
        width: theme.composition.profile.sign,
        height: theme.composition.profile.sign,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: theme.radius.item,
    },
    site: {
        backgroundColor: theme.plane.well,
    },
    document: {
        backgroundColor: theme.tone.brand.vivid,
    },
    rows: {
        gap: theme.space["2"],
    },
    note: {
        ...theme.card,
        gap: theme.space["1"],
        padding: theme.space["4"],
    },
    noteHead: {
        flexDirection: "row",
        alignItems: "center",
        gap: theme.space["2"],
    },

}));
