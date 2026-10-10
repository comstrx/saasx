"use client";

import { useMediaQuery } from "@/hooks/use-effects";
import { useRead } from "@/hooks/use-operation";
import { useUi } from "@/stores/provider";

export type TabBadge = "chat" | "notifications";

export function useNavTabs ( badges: readonly TabBadge[] ) {

    const user = useUi(( state ) => (state.token ? state.user : null));
    const phone = useMediaQuery("(width < 48rem)");
    const live = phone && Boolean(user);
    const rooms = useRead("chat", "rooms", { limit: 20 }, { enabled: live && badges.includes("chat"), live: "chat" });
    const stats = useRead("notifications", "stats", {}, { enabled: live && badges.includes("notifications"), live: "notifications" });

    return {
        chat: (rooms.data ?? []).reduce(( total, room ) => total + (room.unread_count ?? 0), 0),
        notifications: stats.data?.unread ?? 0,
    };

}
