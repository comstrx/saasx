import { FlashList, type FlashListRef } from "@shopify/flash-list";
import * as Clipboard from "expo-clipboard";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { StyleSheet } from "react-native-unistyles";
import { Viewer } from "@/components/viewer";
import { Alert } from "@/elements/alert";
import { AppBar } from "@/elements/app-bar";
import { Avatar } from "@/elements/avatar";
import { Button } from "@/elements/button";
import { Dock } from "@/elements/dock";
import { Empty } from "@/elements/empty";
import { tooLarge } from "@/elements/hooks/use-image-pick";
import { Menu } from "@/elements/menu";
import { Plate } from "@/elements/plate";
import { Screen } from "@/elements/screen";
import { Search } from "@/elements/search";
import { Spinner } from "@/elements/spinner";
import { Text } from "@/elements/text";
import { MessageMenu } from "@/features/chat/components/action-sheet";
import { ChatBubble } from "@/features/chat/components/bubble";
import { ChatHead } from "@/features/chat/components/chat-head";
import { ChatComposer } from "@/features/chat/components/composer";
import { ThreadSkeleton } from "@/features/chat/components/thread-skeleton";
import { ChatUtilitySheets } from "@/features/chat/components/utility-sheets";
import { Wallpaper } from "@/features/chat/components/wallpaper";
import { useChatComposer } from "@/features/chat/hooks/use-chat-composer";
import { Guest, Trouble } from "@/features/shell";
import { useWhen } from "@/features/shell/hooks/use-when";
import { retreat } from "@/features/shell/retreat";
import { attachmentsOf, type ChatAttachment, type Message, mergeThread, messagePreview, platform, roomTitle, viewable } from "@/model/chat";
import { uploadCap } from "@/model/contract";
import { notFound } from "@/model/failure";
import { threadWindow, useEdit, useForward, useHistory, useMessages, useReaction, useRemoveMessage, useRoom, useRoomFlag, useRoomSeen, useRooms, useSend, useStar, useTypingSignal } from "@/query/chat";
import { useLimits } from "@/query/contract";
import { useRealtime } from "@/query/realtime";
import { itemsOf } from "@/query/shelf";
import { useViewer } from "@/query/wire";
import { notify } from "@/store/notice";
import { useSession } from "@/store/session";
import { useTheme } from "@/theme/use-theme";

type Line = {
    message: Message;
    day: string | null;
};

export function RoomScreen () {

    const { t } = useTranslation();
    const token = useSession(( state ) => state.token );
    const when = useWhen();
    const theme = useTheme();
    const params = useLocalSearchParams<{ id?: string }>();

    const id = Number(params.id ?? 0);
    const roomQuery = useRoom(id);
    const rooms = useRooms();
    const thread = useMessages(id);
    const [ older, setOlder ] = useState(false);
    const history = useHistory(id, older);
    const send = useSend(id);
    const edit = useEdit(id);
    const forward = useForward(id);
    const reaction = useReaction(id);
    const star = useStar(id);
    const remove = useRemoveMessage(id);
    const flag = useRoomFlag();
    const limits = useLimits();
    const cap = uploadCap(limits.data, "message");
    const composer = useChatComposer(cap);
    const signal = useTypingSignal(id);

    useRoomSeen(id, Boolean(roomQuery.data));

    const scroller = useRef<FlashListRef<Line>>(null);
    const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const me = useViewer();

    const [ typing, setTyping ] = useState(false);
    const [ selected, setSelected ] = useState<Message | null>(null);
    const held = useRef<View | null>(null);
    const [ dropping, setDropping ] = useState<number | null>(null);
    const [ editing, setEditing ] = useState<Message | null>(null);
    const [ forwarding, setForwarding ] = useState<Message | null>(null);
    const [ attachmentOpen, setAttachmentOpen ] = useState(false);
    const [ emojiOpen, setEmojiOpen ] = useState(false);
    const [ reacting, setReacting ] = useState<Message | null>(null);
    const [ viewing, setViewing ] = useState<ChatAttachment | null>(null);
    const [ searching, setSearching ] = useState(false);
    const [ menuing, setMenuing ] = useState(false);
    const more = useRef<View>(null);
    const [ query, setQuery ] = useState("");

    const refresh = useCallback(( payload: { event?: string; user?: { id?: number } } ) => {

        if ( payload.event === "ROOM.TYPING" && payload.user?.id !== me ) {

            setTyping(true);
            if ( typingTimer.current ) clearTimeout(typingTimer.current);
            typingTimer.current = setTimeout(() => setTyping(false), 3200);
            return;

        }

        void thread.refetch();

    }, [ me, thread.refetch ]);

    useRealtime(roomQuery.data ? `chat.room.${ id }` : null, ".chat.event", refresh);

    useEffect(() => () => {

        if ( typingTimer.current ) clearTimeout(typingTimer.current);

    }, []);

    const pin = useCallback(( animated: boolean ) => {

        requestAnimationFrame(() => scroller.current?.scrollToEnd({ animated }));

    }, []);

    const reach = () => {

        if ( searching ) return;

        if ( !older ) setOlder(( thread.data?.length ?? 0 ) >= threadWindow);
        else if ( history.hasNextPage && !history.isFetchingNextPage ) void history.fetchNextPage();

    };

    const messages = useMemo(() => mergeThread(itemsOf(history.data), thread.data ?? []), [ history.data, thread.data ]);

    const items = useMemo(() => {

        const needle = query.trim().toLocaleLowerCase();

        return messages.filter(( message ) => !needle || message.body.toLocaleLowerCase().includes(needle) );

    }, [ query, messages ]);

    const shots = useMemo(
        () => attachmentsOf(messages).filter(viewable).map(( item ) => ({
            id: String(item.id),
            url: item.url,
            video: item.kind === "video",
        })),
        [ messages ],
    );

    const stamp = when.clock;
    const day = when.date;
    const today = when.date(new Date().toISOString());
    const room = roomQuery.data ?? null;

    const lines = useMemo(() => items.map(( message, index ): Line => {

        const stamped = day(message.at);
        const shifted = index === 0 || stamped !== day(items[index - 1]?.at ?? null);

        return { message, day: shifted && stamped ? stamped === today ? t("chat.today") : stamped : null };

    }), [ items, day, today, t ]);

    const submit = () => {

        const body = composer.draft.trim();

        if ( !body && !composer.files.length ) return;

        if ( editing ) {

            edit.mutate({ message: editing.id, content: body });
            setEditing(null);
            composer.clear();
            return;

        }
        send.mutate({
            body,
            replyId: composer.reply?.id,
            files: composer.files,
        });

        composer.clear();
        pin(true);

    };

    const finishRecording = async () => {

        const audio = await composer.finishRecording();

        if ( !audio ) return;

        send.mutate({ body: "", kind: "audio", files: [ audio ], replyId: composer.reply?.id });
        composer.clear();

    };

    const protect = async ( action: () => Promise<void> ) => {

        try { await action(); }
        catch ( reason ) {

            notify(reason instanceof Error && reason.message === tooLarge
                ? t("personal.avatarTooLarge", { value: Math.floor(cap / ( 1024 * 1024 )) })
                : t("chat.permissionBody"));

        }

    };

    const pick = async ( action: () => Promise<void> ) => {

        setAttachmentOpen(false);
        await protect(action);

    };

    const reactTo = ( emoji: string | null ) => {

        if ( !selected ) return;

        reaction.mutate({ message: selected.id, emoji });
        setSelected(null);

    };

    const removeSelected = () => {

        if ( !selected ) return;

        setDropping(selected.id);
        setSelected(null);

    };

    const loading = id > 0 && ( roomQuery.isPending || thread.isPending );
    const broken = roomQuery.error ?? thread.error ?? ( !roomQuery.isPending && !room ? notFound : null );

    const status = broken
        ? undefined
        : loading
            ? t("common.loading")
        : typing
            ? t("chat.typing")
        : room?.online
            ? t("chat.online")
        : room?.lastSeenAt
            ? t("chat.lastSeen", { value: stamp(room.lastSeenAt) })
            : room?.note || t("chat.offline");

    const retry = () => {

        void roomQuery.refetch();
        void thread.refetch();

    };

    if ( !token ) return (
        <Screen edges={[ "top" ]} padded={false}>
            <AppBar title={t("chat.title")} onBack={() => retreat() } />
            <Guest note={t("chat.guestSummary")} onLogin={() => router.push("/login") } />
        </Screen>
    );

    const overflow = [
        { key: "search", label: searching ? t("common.close") : t("search.title"), icon: searching ? "close" as const : "search" as const, onPress: () => { setSearching(( current ) => !current); if ( searching ) setQuery(""); } },
        { key: "info", label: t("chat.roomInfo"), icon: "info" as const, onPress: () => router.push(`/room/${ id }/info`) },
        ...( room ? [ { key: "mute", label: room.muted ? t("chat.unmute") : t("chat.mute"), icon: "muted" as const, onPress: () => flag.mutate({ id, flag: "muted", on: !room.muted }) } ] : [] ),
    ];

    return (
        <Screen edges={[]} padded={false}>
            <Wallpaper />

            <ChatHead
                onBack={() => retreat() }
                figure={room && platform(room)
                    ? <Plate icon="support" size={theme.composition.bubble.face} look="solid" />
                    : <Avatar name={room?.name} source={room?.image ?? undefined} size={theme.composition.bubble.face} />}
                title={room ? roomTitle(room, t("chat.support")) : t("chat.title")}
                status={status}
                tint={!broken && room?.online ? "success" : undefined}
                onTitle={room ? () => router.push(`/room/${ id }/info`) : undefined}
                more={more}
                onMore={broken ? undefined : () => setMenuing(true) }
            >
                {searching ? <Search autoFocus value={query} onChangeText={setQuery} placeholder={t("chat.searchInChat")} /> : null}
            </ChatHead>

            <KeyboardAvoidingView behavior="padding" style={styles.fill} keyboardVerticalOffset={theme.space["2"]}>
                {broken ? (
                    <View style={styles.fill}><Trouble reason={broken} onRetry={retry} /></View>
                ) : loading ? (
                    <View style={styles.waiting}><ThreadSkeleton /></View>
                ) : lines.length === 0 ? (
                    <View style={styles.fill}>
                        <Empty emblem={searching ? "search" : "chat"} title={searching ? t("chat.noMatches") : t("chat.startedTitle")} note={searching ? t("chat.noMatchesBody") : t("chat.startedBody")} />
                    </View>
                ) : (
                    <FlashList
                        ref={scroller}
                        data={lines}
                        keyExtractor={( line ) => String(line.message.id) }
                        getItemType={( line ) => line.message.kind }
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                        contentContainerStyle={styles.messages}
                        ItemSeparatorComponent={Seam}
                        ListHeaderComponent={history.isFetching ? <View style={styles.older}><Spinner size={theme.icon.md} /></View> : null}
                        onStartReached={reach}
                        onStartReachedThreshold={0.5}
                        maintainVisibleContentPosition={{ startRenderingFromBottom: true, autoscrollToBottomThreshold: 0.25 }}
                        renderItem={({ item: line }) => (
                            <View style={styles.chunk}>
                                {line.day ? (
                                    <View style={styles.day}>
                                        <Text rank="label" color={theme.material.lit}>{line.day}</Text>
                                    </View>
                                ) : null}

                                <ChatBubble
                                    message={line.message}
                                    time={stamp(line.message.at)}
                                    onLongPress={( anchor ) => {

                                        if ( line.message.id <= 0 ) return;

                                        held.current = anchor.current;
                                        setSelected(line.message);

                                    }}
                                    onReaction={( emoji ) => reaction.mutate({ message: line.message.id, emoji })}
                                    onOpenMedia={setViewing}
                                    onOpenOrder={( order ) => router.push(`/order/${ order }`) }
                                />
                            </View>
                        )}
                    />
                )}

                {broken ? null : room?.blocked ? (
                    <Dock inline>
                        <View style={styles.barred}>
                            <Text rank="caption" ink="soft" align="center">{t("chat.blockedNote", { name: room.name })}</Text>
                            <Button
                                block
                                kind="soft"
                                label={t("chat.unblock", { name: room.name })}
                                loading={flag.isPending}
                                onPress={() => flag.mutate({ id, flag: "blocked", on: false })}
                            />
                        </View>
                    </Dock>
                ) : <ChatComposer
                    draft={composer.draft}
                    files={composer.files}
                    reply={composer.reply}
                    editing={editing ? messagePreview(editing) : null}
                    recording={composer.recording}
                    recordingMillis={composer.recordingMillis}
                    busy={send.isPending}
                    onChange={( value ) => {
                        composer.setDraft(value);
                        signal();
                    }}
                    onSend={submit}
                    onAttach={() => setAttachmentOpen(true)}
                    onEmoji={() => setEmojiOpen(true)}
                    onRemoveFile={composer.removeFile}
                    onCancelReply={() => composer.setReply(null)}
                    onCancelEdit={() => {
                        setEditing(null);
                        composer.clear();
                    }}
                    onStartRecording={() => void protect(composer.startRecording)}
                    onFinishRecording={() => void protect(finishRecording)}
                    onCancelRecording={() => void composer.cancelRecording()}
                />}
            </KeyboardAvoidingView>

            <Menu open={menuing} anchor={more} items={overflow} onClose={() => setMenuing(false) } />

            <MessageMenu
                message={selected}
                anchor={held}
                onClose={() => setSelected(null)}
                onReaction={reactTo}
                onMoreEmoji={() => { setReacting(selected); setSelected(null); setEmojiOpen(true); }}
                onReply={() => {
                    if ( selected ) {
                        setEditing(null);
                        composer.setReply(messagePreview(selected));
                    }
                    setSelected(null);
                }}
                onCopy={() => {
                    if ( selected?.body ) void Clipboard.setStringAsync(selected.body);
                    setSelected(null);
                }}
                onStar={() => {
                    if ( selected ) star.mutate({ message: selected.id, starred: !selected.starred });
                    setSelected(null);
                }}
                onEdit={() => {
                    if ( selected ) {
                        composer.clear();
                        composer.setDraft(selected.body);
                        setEditing(selected);
                    }
                    setSelected(null);
                }}
                onForward={() => {
                    if ( selected ) setForwarding(selected);
                    setSelected(null);
                }}
                onRemove={removeSelected}
            />

            <ChatUtilitySheets
                rooms={( rooms.data ?? [] ).filter(( target ) => target.id !== id && !target.archived)}
                attachmentOpen={attachmentOpen}
                emojiOpen={emojiOpen}
                forwardOpen={Boolean(forwarding)}
                onCloseAttachment={() => setAttachmentOpen(false)}
                onCloseEmoji={() => { setEmojiOpen(false); setReacting(null); }}
                onCloseForward={() => setForwarding(null)}
                onPickMedia={() => void pick(composer.pickMedia)}
                onTakePhoto={() => void pick(composer.takePhoto)}
                onPickDocument={() => void pick(composer.pickDocument)}
                onEmoji={( emoji ) => {

                    if ( reacting ) reaction.mutate({ message: reacting.id, emoji });
                    else composer.setDraft(`${ composer.draft }${ emoji }`);

                    setEmojiOpen(false);
                    setReacting(null);

                }}
                onForward={( target ) => {
                    if ( forwarding ) forward.mutate({ message: forwarding.id, room: target.id });
                    setForwarding(null);
                }}
            />

            <Viewer
                open={Boolean(viewing)}
                items={shots}
                start={Math.max(0, shots.findIndex(( item ) => item.id === String(viewing?.id) ))}
                onClose={() => setViewing(null)}
            />

            <Alert
                open={dropping !== null}
                title={t("chat.delete")}
                body={t("chat.deleteBody")}
                emblem="trash"
                confirm={t("chat.delete")} onConfirm={() => {

                    if ( dropping !== null ) remove.mutate(dropping);

                    setDropping(null);

                }} tone="danger"
                cancel={t("common.cancel")}
                onClose={() => setDropping(null)}
            />
        </Screen>
    );

}

function Seam () {

    return <View style={styles.seam} />;

}

const styles = StyleSheet.create(( theme ) => ({

    fill: {
        flex: 1,
    },
    waiting: {
        flex: 1,
        justifyContent: "flex-end",
        paddingBottom: theme.space["4"],
    },
    messages: {
        paddingHorizontal: theme.layout.gutter,
        paddingBottom: theme.space["4"],
    },
    seam: {
        height: theme.space["3"],
    },
    older: {
        alignItems: "center",
        paddingVertical: theme.space["3"],
    },
    chunk: {
        gap: theme.space["2"],
    },
    day: {
        alignSelf: "center",
        marginVertical: theme.space["2"],
        paddingVertical: theme.space["1"] + 1,
        paddingHorizontal: theme.space["3"],
        borderRadius: theme.radius.pill,
        backgroundColor: theme.chat.stamp,
    },
    barred: {
        gap: theme.space["3"],
    },

}));
