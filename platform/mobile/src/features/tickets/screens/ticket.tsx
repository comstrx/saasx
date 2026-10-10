import { router, useLocalSearchParams } from "expo-router";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { StyleSheet } from "react-native-unistyles";
import { AppBar } from "@/elements/app-bar";
import { Avatar } from "@/elements/avatar";
import { Badge } from "@/elements/badge";
import { Box } from "@/elements/box";
import { Button } from "@/elements/button";
import { Dock } from "@/elements/dock";
import { Emblem } from "@/elements/emblem";
import { Empty } from "@/elements/empty";
import { Field } from "@/elements/field";
import { usePull } from "@/elements/hooks/use-pull";
import { Icon } from "@/elements/icon";
import { Menu, type MenuItem } from "@/elements/menu";
import { Stagger } from "@/elements/motion";
import { Press } from "@/elements/press";
import { Round } from "@/elements/round";
import { Screen } from "@/elements/screen";
import { Scroll } from "@/elements/scroll";
import { Skeleton } from "@/elements/skeleton";
import { Text } from "@/elements/text";
import { Guest, Trouble } from "@/features/shell";
import { useWhen } from "@/features/shell/hooks/use-when";
import { retreat } from "@/features/shell/retreat";
import { ticketTints } from "@/features/tickets/components/ticket-card";
import { failureShape } from "@/model/failure";
import { open, type TicketAuthor, type TicketReply } from "@/model/ticket";
import { useMoveTicket, useReplyTicket, useTicket } from "@/query/tickets";
import { useViewer } from "@/query/wire";
import { notify } from "@/store/notice";
import { useSession } from "@/store/session";
import { useTheme } from "@/theme/use-theme";

type NoteProps = {
    author: TicketAuthor | null;
    content: string;
    at: string;
    me: number;
};

function Note ({ author, content, at, me }: NoteProps) {

    const { t } = useTranslation();
    const theme = useTheme();
    const staff = author !== null && author.id !== me ? author : null;

    return (
        <View style={[ styles.line, staff ? null : styles.mine ]}>
            {staff ? <Avatar name={staff.name} source={staff.image ?? undefined} size={theme.composition.bubble.face} /> : null}

            <View style={[ styles.bubble, { backgroundColor: staff ? theme.chat.theirs : theme.chat.mine } ]}>
                {staff ? (
                    <View style={styles.who}>
                        <Text rank="label" tint="brand" numberOfLines={1} style={styles.name}>{staff.name || t("tickets.agent")}</Text>
                        {staff.name ? <Text rank="note" ink="soft">{t("tickets.agent")}</Text> : null}
                    </View>
                ) : null}

                <Text rank="body">{content}</Text>
                <Text rank="note" color={staff ? theme.ink.faint : theme.chat.mineMeta} style={styles.stamp}>{at}</Text>
            </View>
        </View>
    );

}

export function TicketScreen () {

    const { t } = useTranslation();
    const token = useSession(( state ) => state.token );
    const when = useWhen();
    const theme = useTheme();
    const params = useLocalSearchParams<{ id?: string }>();

    const id = Number(params.id ?? 0) || 0;
    const me = useViewer();
    const thread = useTicket(id);
    const pull = usePull(thread.refetch);
    const replying = useReplyTicket(id);
    const moving = useMoveTicket(id);

    const [ draft, setDraft ] = useState("");
    const [ error, setError ] = useState("");
    const [ menuing, setMenuing ] = useState(false);
    const more = useRef<View>(null);

    const ticket = thread.data;
    const live = ticket ? open(ticket) : false;

    const send = async () => {

        const content = draft.trim();

        if ( !content || replying.isPending ) return;

        setError("");

        try {

            await replying.mutateAsync(content);
            setDraft("");

        }
        catch ( failure ) {

            const shape = failureShape(failure, [ "content" ]);

            if ( shape.fields.content ) setError(shape.fields.content);
            else notify(shape.body);

        }

    };

    const move = async ( action: "resolve" | "close" | "reopen" ) => {

        if ( moving.isPending ) return;

        try {

            await moving.mutateAsync(action);
            notify(t(`tickets.${ action }Done`), "success");

        }
        catch ( failure ) {

            notify(failureShape(failure).body);

        }

    };

    const moves: readonly MenuItem[] = [
        { key: "resolve", label: t("tickets.resolve"), icon: "checkCircle", onPress: () => { void move("resolve"); } },
        { key: "close", label: t("tickets.close"), icon: "lock", onPress: () => { void move("close"); } },
    ];

    const frame = ( children: React.ReactNode, footer?: React.ReactNode, alone = false ) => (
        <Screen edges={[ "top" ]} padded={false}>
            <AppBar
                title={t("tickets.detail")}
                onBack={() => retreat() }
                actions={live ? (
                    <View ref={more} collapsable={false}>
                        <Round icon="more" disabled={moving.isPending} onPress={() => setMenuing(true) } label={t("common.more")} />
                    </View>
                ) : undefined}
            />

            <KeyboardAvoidingView behavior="padding" style={styles.spring} keyboardVerticalOffset={theme.space["2"]}>
                <Scroll contentContainerStyle={styles.scroll} refreshing={pull.refreshing} onRefresh={pull.onRefresh}>
                    <Stagger style={alone ? styles.spring : undefined}>
                        {children}
                    </Stagger>
                </Scroll>

                {footer}
            </KeyboardAvoidingView>

            <Menu open={menuing} anchor={more} items={moves} onClose={() => setMenuing(false) } />
        </Screen>
    );

    if ( !token ) return frame(<Guest note={t("tickets.guestBody")} onLogin={() => router.push("/login") } />, undefined, true);

    if ( id > 0 && thread.isPending ) {

        return frame(
            <Box gap="4">
                <Skeleton curve="card" height={theme.art.sm + theme.space["6"]} />
                <Skeleton curve="card" height={theme.art.md} />
                <Skeleton curve="card" height={theme.art.md} />
            </Box>,
        );

    }

    if ( !ticket ) {

        return frame(
            thread.isError
                ? <Trouble reason={thread.error} onRetry={() => { void thread.refetch(); }} />
                : <Empty emblem="support" title={t("tickets.missingTitle")} note={t("tickets.missingBody")} />,
            undefined,
            true,
        );

    }

    const notes: readonly TicketReply[] = [ { id: 0, content: ticket.content, createdAt: ticket.createdAt, author: ticket.author }, ...ticket.replies ];
    const today = when.date(new Date().toISOString());

    return frame(
        <>
            <Box gap="4" style={styles.summary}>
                <Box row align="center" gap="3">
                    <Badge label={t(`tickets.status.${ ticket.status }`)} tint={ticketTints[ticket.status]} />

                    <Box style={styles.spring} />

                    <Text rank="note" ink="faint">{t("tickets.number", { id: ticket.id })}</Text>
                </Box>

                <Box row align="center" gap="4">
                    <Emblem name="support" size={theme.composition.service.art} />
                    <Text rank="title" style={styles.spring}>{ticket.title}</Text>
                </Box>

                <Box gap="2">
                    <Box row align="center" gap="2">
                        <Icon name="clock" size={theme.icon.xs} tint="faint" />
                        <Text rank="note" ink="faint">{t("tickets.openedAt", { at: when.moment(ticket.createdAt) })}</Text>
                    </Box>

                    {ticket.resolvedAt ? (
                        <Box row align="center" gap="2">
                            <Icon name="checkCircle" size={theme.icon.xs} tint="faint" />
                            <Text rank="note" ink="faint">{t("tickets.resolvedAt", { at: when.moment(ticket.resolvedAt) })}</Text>
                        </Box>
                    ) : null}

                    {ticket.closedAt ? (
                        <Box row align="center" gap="2">
                            <Icon name="lock" size={theme.icon.xs} tint="faint" />
                            <Text rank="note" ink="faint">{t("tickets.closedAt", { at: when.moment(ticket.closedAt) })}</Text>
                        </Box>
                    ) : null}
                </Box>

                {ticket.order ? (
                    <Press
                        style={styles.linked}
                        onPress={() => router.push(`/order/${ ticket.order?.id }`) }
                        sink="tile"
                        accessibilityRole="button"
                    >
                        <Icon name="orders" size={theme.icon.md} tint="soft" />
                        <Text rank="label" style={styles.spring} numberOfLines={1}>
                            {t("tickets.orderRef", { id: ticket.order.id })}
                        </Text>
                        <Text rank="caption" tint="brand" numberOfLines={1}>{t("tickets.openOrder")}</Text>
                    </Press>
                ) : null}
            </Box>

            <View style={styles.thread}>
                {notes.map(( note, index ) => {

                    const stamped = when.date(note.createdAt);
                    const shifted = stamped !== "" && ( index === 0 || stamped !== when.date(notes[index - 1]?.createdAt) );

                    return (
                        <View key={note.id} style={styles.chunk}>
                            {shifted ? (
                                <View style={styles.day}>
                                    <Text rank="label" color={theme.material.lit}>{stamped === today ? t("common.today") : stamped}</Text>
                                </View>
                            ) : null}

                            <Note author={note.author} content={note.content} at={when.clock(note.createdAt)} me={me} />
                        </View>
                    );

                })}
            </View>
        </>,
        <Dock inline>
            {live ? (
                <Field
                    placeholder={t("tickets.replyHint")}
                    value={draft}
                    error={error}
                    action="send"
                    actionLabel={t("common.send")}
                    multiline
                    onChangeText={setDraft}
                    onAction={() => { void send(); }}
                />
            ) : (
                <Button
                    label={t("tickets.reopen")}
                    kind="soft" tint="neutral"
                    icon="refresh"
                    loading={moving.isPending}
                    onPress={() => { void move("reopen"); }}
                />
            )}
        </Dock>,
    );

}

const styles = StyleSheet.create(( theme ) => ({

    scroll: {
        gap: theme.layout.stack,
    },
    summary: {
        ...theme.card,
        marginHorizontal: theme.layout.gutter,
        padding: theme.space["4"],
    },
    spring: {
        flex: 1,
    },
    linked: {
        flexDirection: "row",
        alignItems: "center",
        gap: theme.space["3"],
        minHeight: theme.control.sm.height,
    },
    thread: {
        paddingHorizontal: theme.layout.gutter,
        gap: theme.space["2"],
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
    line: {
        maxWidth: "86%",
        flexDirection: "row",
        alignItems: "flex-end",
        alignSelf: "flex-start",
        gap: theme.space["2"],
    },
    mine: {
        alignSelf: "flex-end",
    },
    bubble: {
        flexShrink: 1,
        minWidth: theme.space["9"],
        gap: theme.space["1"],
        paddingVertical: theme.space["2"] + theme.space["1"] / 2,
        paddingHorizontal: theme.space["3"] + theme.space["1"] / 2,
        borderRadius: theme.composition.bubble.radius,
    },
    who: {
        flexDirection: "row",
        alignItems: "baseline",
        gap: theme.space["2"],
    },
    name: {
        flexShrink: 1,
    },
    stamp: {
        alignSelf: "flex-end",
        opacity: theme.state.quiet,
    },

}));
