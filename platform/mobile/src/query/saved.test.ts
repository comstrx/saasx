import type { PersistedClient } from "@tanstack/react-query-persist-client";
import { settled } from "@/query/saved";

const held = ( status: "success" | "error", data: unknown ) => ({
    queryKey: [ "account", "profile" ],
    queryHash: `["account","profile",${ status }]`,
    state: {
        data,
        dataUpdateCount: 1,
        dataUpdatedAt: 1000,
        error: status === "error" ? new Error("offline") : null,
        errorUpdateCount: status === "error" ? 1 : 0,
        errorUpdatedAt: status === "error" ? 2000 : 0,
        fetchFailureCount: status === "error" ? 3 : 0,
        fetchFailureReason: status === "error" ? new Error("offline") : null,
        fetchMeta: null,
        isInvalidated: false,
        status,
        fetchStatus: "idle" as const,
    },
});

const client = ( queries: ReturnType<typeof held>[] ): PersistedClient => ({
    timestamp: 3000,
    buster: "5-ar-EGP",
    clientState: { mutations: [], queries },
});

describe("the saved cache keeps the last good answer", () => {

    test("a query whose refetch failed is saved as the data it last held", () => {

        const [ saved ] = settled(client([ held("error", { name: "QA" }) ])).clientState.queries;

        expect(saved?.state).toMatchObject({ status: "success", data: { name: "QA" }, dataUpdatedAt: 1000, error: null, fetchFailureCount: 0, fetchFailureReason: null });

    });

    test("a healthy query is saved untouched", () => {

        const healthy = held("success", { name: "QA" });

        expect(settled(client([ healthy ])).clientState.queries[0]).toBe(healthy);

    });

});
