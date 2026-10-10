import { router, useLocalSearchParams } from "expo-router";
import { usePull } from "@/elements/hooks/use-pull";
import { MessagesScreen } from "@/features/chat/components/messages";
import { useRemoveRoom, useRoomFlag, useRooms, useSupportRoom } from "@/query/chat";
import { useAlertCount } from "@/query/notifications";
import { useSession } from "@/store/session";

export function ChatScreen () {

    const token = useSession(( state ) => state.token );
    const params = useLocalSearchParams<{ desk?: string }>();
    const rooms = useRooms();
    const alerts = useAlertCount();
    const flag = useRoomFlag();
    const remove = useRemoveRoom();
    const desk = useSupportRoom();
    const pull = usePull(rooms.refetch);

    return (
        <MessagesScreen
            authenticated={Boolean(token)}
            desk={params.desk}
            rooms={rooms.data ?? []}
            pending={rooms.isPending}
            failure={rooms.isError && !rooms.data ? rooms.error : undefined}
            fetching={pull.refreshing}
            onRefresh={pull.onRefresh}
            onLogin={() => router.push("/login")}
            onOpenRoom={( room ) => router.push(`/room/${ room.id }`)}
            alerts={token ? alerts.data?.unread ?? 0 : 0}
            onAlerts={() => router.push("/notifications")}
            onDesk={() => { if ( !desk.isPending ) desk.mutate(undefined, { onSuccess: ( id ) => router.push(`/room/${ id }`) }); }}
            onFlag={( room, which, on ) => flag.mutate({ id: room.id, flag: which, on })}
            onRemove={( room ) => remove.mutate(room.id)}
            onNotifications={() => router.push("/notify")}
        />
    );

}
