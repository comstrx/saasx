import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { referrals } from "@/api/endpoints/referrals";
import { grantOf, invitedOf } from "@/model/referral";
import { shelve } from "@/model/shelf";
import { nextPage } from "@/query/shelf";
import { useSigned } from "@/query/wire";

const hour = 3600000;

const referralKeys = {
    list: [ "referrals", "list" ] as const,
    programme: [ "referrals", "programme" ] as const,
};

export function useInvited () {

    const signed = useSigned();

    return useInfiniteQuery({
        queryKey: referralKeys.list,
        queryFn: async ({ pageParam }) => shelve(await referrals.list(pageParam), ( rows ) => rows.map(invitedOf)),
        initialPageParam: 1,
        getNextPageParam: nextPage,
        enabled: signed,
    });

}

export function useProgramme () {

    return useQuery({
        queryKey: referralKeys.programme,
        queryFn: async () => ( await referrals.programme() ).map(grantOf),
        staleTime: hour,
    });

}
