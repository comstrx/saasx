import { useEffect } from "react";
import { configureRealtime } from "@/api/realtime";
import { useRooms, useRoomsRefresh } from "@/query/chat";
import { useRealtimeSettings } from "@/query/contract";
import { useAlertRefresh } from "@/query/notifications";
import { useOrdersRefresh } from "@/query/orders";
import { useRealtime } from "@/query/realtime";
import { useWalletRefresh } from "@/query/wallet";
import { useViewer } from "@/query/wire";

export function Tune () {

    const served = useRealtimeSettings().data;

    useEffect(() => {

        if ( served ) configureRealtime(served);

    }, [ served ]);

    return null;

}

function Wire ({ room, onEvent }: { room: number; onEvent: () => void }) {

    useRealtime<{ event?: string }>(`chat.room.${ room }`, ".chat.event", ( payload ) => {

        if ( payload.event !== "ROOM.TYPING" ) onEvent();

    });

    return null;

}

export function Live () {

    const me = useViewer();
    const rooms = useRooms();
    const alerts = useAlertRefresh();
    const orders = useOrdersRefresh();
    const purse = useWalletRefresh();
    const inbox = useRoomsRefresh();

    useRealtime(me > 0 ? `notification.${ me }` : null, ".notification.event", () => {

        alerts();
        orders();
        purse();

    });

    useRealtime(me > 0 ? `chat.${ me }` : null, ".chat.event", inbox, "presence");

    return ( rooms.data ?? [] ).map(( room ) => <Wire key={room.id} room={room.id} onEvent={inbox} /> );

}
