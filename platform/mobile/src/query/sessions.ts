import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { sessions } from "@/api/endpoints/sessions";
import { deviceOf } from "@/model/session";
import { useSigned } from "@/query/wire";
import { key } from "@/std/key";

const sessionKeys = {
    list: [ "sessions" ] as const,
};

export function useDevices () {

    const signed = useSigned();

    return useQuery({
        queryKey: sessionKeys.list,
        queryFn: async () => ( await sessions.list() ).map(deviceOf),
        enabled: signed,
    });

}

export function useRevokeDevice () {

    const cache = useQueryClient();

    return useMutation({
        mutationFn: ( id: number | null ) => id === null
            ? sessions.revokeOthers(key.attempt("sessions-revoke-all"))
            : sessions.revoke(id, key.attempt("session-revoke")),
        onSettled: () => { cache.invalidateQueries({ queryKey: sessionKeys.list }); },
    });

}
