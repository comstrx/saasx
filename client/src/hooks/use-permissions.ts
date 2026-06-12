import { useQuery } from "@tanstack/react-query";
import { has, hasAll, hasAny, type Permission, toSet } from "@/lib/std/permissions";

export function usePermissions () {

    const { data: permissions } = useQuery({
        queryKey: ["auth", "permissions"],
        queryFn: async (): Promise<string[]> => { throw new Error("auth feature not wired"); },
        enabled: false,
        initialData: [] as string[],
        select: toSet,
    });

    return {
        permissions,
        has: ( perm: Permission ) => has(permissions, perm),
        hasAll: ( perms: Permission[] ) => hasAll(permissions, perms),
        hasAny: ( perms: Permission[] ) => hasAny(permissions, perms),
    };

}
