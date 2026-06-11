import type { Permission, PermissionSet } from "./permission";

export function has( set: PermissionSet, perm: Permission ): boolean {

    return set.has(perm);

}

export function hasAll( set: PermissionSet, perms: Permission[] ): boolean {

    return perms.every((perm) => set.has(perm));

}

export function hasAny( set: PermissionSet, perms: Permission[] ): boolean {

    return perms.some((perm) => set.has(perm));

}
