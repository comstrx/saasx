"use client";

import { useRead } from "@/hooks/use-operation";
import { useUi } from "@/stores/provider";

export type FavoriteState = {
    saved: boolean | null; loading: boolean; failed: boolean; expired: boolean; version: object | null; reload: () => void;
};

export function useProductFavorites ( productIds: readonly number[], enabled = true ) {

    const ready = useUi(( state ) => state.ready);
    const token = useUi(( state ) => state.token);
    const user = useUi(( state ) => state.user);
    const ids = [...new Set(productIds)].filter(( id ) => Number.isSafeInteger(id) && id > 0).sort(( a, b ) => a - b).slice(0, 100);
    const allowed = user?.permissions?.some(( value ) => value === "add_favorites" || value === "delete_favorites") === true;
    const request = useRead("products", "list", {
        ids, limit: Math.max(1, ids.length), fields: ["id", "name", "type", "in_favorites"],
    }, { enabled: enabled && ready && !!token && allowed && ids.length > 0 });

    function state ( id: number ): FavoriteState {

        const row = request.data?.find(( item ) => item.id === id);

        return {
            saved: typeof row?.in_favorites === "boolean" ? row.in_favorites : null,
            loading: !ready || request.loading,
            failed: !!request.error || !!request.data && typeof row?.in_favorites !== "boolean",
            expired: request.error?.status === 401, version: request.data, reload: request.reload,
        };

    }

    return { state, identity: token ?? "guest" };

}
