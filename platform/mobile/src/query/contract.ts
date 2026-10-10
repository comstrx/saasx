import { useQuery } from "@tanstack/react-query";
import { useCallback } from "react";
import { contract } from "@/api/endpoints/contract";
import type { RealtimeSettings } from "@/api/realtime";
import type { LineNeed } from "@/model/cart";
import { type Deal, dealOf } from "@/model/catalog";
import { type CatalogType, type Contract, contractOf, type Limits, passwordBase, type Requirements } from "@/model/contract";
import { needsFrom, rangedFrom } from "@/model/requirement";
import type { PasswordPolicy } from "@/std/password";

const hour = 3600000;
const none: readonly string[] = [];

const contractKeys = {
    read: [ "contract" ] as const,
};

const shared = {
    queryKey: contractKeys.read,
    queryFn: async () => contractOf(await contract.read()),
    staleTime: hour / 12,
    gcTime: hour * 24,
} as const;

export function useCatalogTypes () {

    return useQuery({ ...shared, select: ( data: Contract ): readonly CatalogType[] => data.types });

}

export function useCapabilities ( type: string ): readonly string[] {

    const types = useCatalogTypes().data;

    return types?.find(( entry ) => entry.key === type )?.capabilities ?? none;

}

export function useDeal ( type: string ): Deal {

    return dealOf(useCapabilities(type));

}

function useRequirements () {

    return useQuery({ ...shared, select: ( data: Contract ): Requirements => data.requirements });

}

export function useNeeds () {

    const { data } = useRequirements();

    return useCallback(
        ( capabilities: readonly string[] ): readonly LineNeed[] => needsFrom(data ?? {}, capabilities),
        [ data ],
    );

}

export function useRanged () {

    const { data } = useRequirements();

    return useCallback(
        ( capabilities: readonly string[] ): boolean => rangedFrom(data ?? {}, capabilities),
        [ data ],
    );

}

export function useLimits () {

    return useQuery({ ...shared, select: ( data: Contract ): Limits => data.limits });

}

export function usePasswordPolicy (): PasswordPolicy {

    return useQuery({ ...shared, select: ( data: Contract ): PasswordPolicy => data.password }).data ?? passwordBase;

}

export function useRealtimeSettings () {

    return useQuery({ ...shared, select: ( data: Contract ): RealtimeSettings | null => data.realtime });

}
