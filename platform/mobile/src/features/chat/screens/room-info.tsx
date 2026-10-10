import { router, useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { ReportSheet } from "@/components/report-sheet";
import { Alert } from "@/elements/alert";
import { AppBar } from "@/elements/app-bar";
import { Screen } from "@/elements/screen";
import { ChatInfoScreen } from "@/features/chat/components/info";
import { Guest } from "@/features/shell";
import { useReportCopy } from "@/features/shell/copy";
import { retreat } from "@/features/shell/retreat";
import { attachmentsOf, type ChatAttachment, type ChatLink, linksOf, type Message, starredOf } from "@/model/chat";
import { useMessages, useRemoveRoom, useReportRoom, useRoom, useRoomFlag } from "@/query/chat";
import { notify } from "@/store/notice";
import { useSession } from "@/store/session";

export function RoomInfoScreen () {

    const { t } = useTranslation();
    const token = useSession(( state ) => state.token );
    const reportCopy = useReportCopy();
    const params = useLocalSearchParams<{ id?: string }>();
    const id = Number(params.id ?? 0);

    const room = useRoom(id);
    const thread = useMessages(id);
    const flag = useRoomFlag();
    const remove = useRemoveRoom();
    const report = useReportRoom();
    const [ reporting, setReporting ] = useState(false);
    const [ pending, setPending ] = useState<"block" | "leave" | null>(null);

    const media = useMemo((): readonly ChatAttachment[] => attachmentsOf(thread.data ?? []), [ thread.data ]);
    const links = useMemo((): readonly ChatLink[] => linksOf(thread.data ?? []), [ thread.data ]);
    const starred = useMemo((): readonly Message[] => starredOf(thread.data ?? []), [ thread.data ]);

    const name = room.data?.name || t("chat.title");

    const leave = () => {

        remove.mutate(id);
        router.dismissAll();

    };

    const settle = () => {

        const asked = pending;

        setPending(null);

        if ( asked === "leave" ) leave();

        if ( asked === "block" ) flag.mutate({ id, flag: "blocked", on: true }, {
            onSuccess: () => notify(t("chat.blocked"), "success"),
        });

    };

    const send = ( reason: string, note: string ) => report.mutate({ id, reason, note }, {
        onSuccess: () => { setReporting(false); notify(t("chat.reported"), "success"); },
    });

    if ( !token ) return (
        <Screen edges={[ "top" ]} padded={false}>
            <AppBar title={t("chat.details")} onBack={() => retreat() } />
            <Guest note={t("chat.guestSummary")} onLogin={() => router.push("/login") } />
        </Screen>
    );
    return (
        <>
            <ChatInfoScreen
                room={room.data ?? null}
                pending={room.isPending}
                failure={room.error}
                onRetry={() => { void room.refetch(); void thread.refetch(); }}
                media={media}
                links={links}
                starred={starred}
                onBack={() => retreat()}
                onFlag={( which, on ) => flag.mutate({ id, flag: which, on })}
                onBlock={() => setPending("block")}
                onReport={() => setReporting(true)}
                onRemove={() => setPending("leave")}
            />

            <Alert
                open={pending !== null}
                title={pending === "block" ? t("chat.block", { name }) : t("chat.removeRoom")}
                body={pending === "block" ? t("chat.blockBody") : t("chat.removeRoomBody")}
                emblem={pending === "block" ? "lock" : "trash"}
                confirm={t("common.confirm")} onConfirm={settle} tone="danger"
                cancel={t("common.cancel")}
                onClose={() => setPending(null)}
            />

            <ReportSheet
                {...reportCopy}
                open={reporting}
                title={t("chat.reportTitle")}
                body={t("chat.reportBody")}
                action={t("details.reportSend")}
                busy={report.isPending}
                onSubmit={send}
                onClose={() => setReporting(false)}
            />
        </>
    );

}
