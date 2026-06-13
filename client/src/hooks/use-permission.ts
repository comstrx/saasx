"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKey, request } from "@/api/client";
import { api } from "@/api/registry";

export type Permission = string;
export type PermissionSet = ReadonlySet<Permission>;

const all = "*";
const empty: PermissionSet = new Set();

export function toSet ( list: string[] ): PermissionSet {

    return new Set(list);

}
export function can ( set: PermissionSet, perm: Permission ): boolean {

    if ( set.has(all) ) return true;
    if ( set.has(perm) ) return true;

    const dot = perm.lastIndexOf(".");

    return dot > 0 && set.has(`${perm.slice(0, dot)}.${all}`);

}
export function canAll ( set: PermissionSet, perms: Permission[] ): boolean {

    return perms.every((perm) => can(set, perm));

}
export function canAny ( set: PermissionSet, perms: Permission[] ): boolean {

    return perms.some((perm) => can(set, perm));

}

export function usePermission () {

    const { data, isPending } = useQuery({
        queryKey: queryKey(api.permissions),
        queryFn: ({ signal }) => request(api.permissions, { signal }),
        staleTime: 5 * 60 * 1000,
        enabled: false,
    });

    const permissions = data ? toSet(data.data) : empty;

    return {
        isPending,
        permissions,
        can: ( perm: Permission ) => can(permissions, perm),
        canAll: ( perms: Permission[] ) => canAll(permissions, perms),
        canAny: ( perms: Permission[] ) => canAny(permissions, perms),
    };

}
