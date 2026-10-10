import type { PersistedClient } from "@tanstack/react-query-persist-client";

export const settled = ( client: PersistedClient ): PersistedClient => ({
    ...client,
    clientState: {
        ...client.clientState,
        queries: client.clientState.queries.map(( query ) => query.state.status === "error"
            ? { ...query, state: { ...query.state, status: "success", error: null, fetchFailureCount: 0, fetchFailureReason: null } }
            : query ),
    },
});
