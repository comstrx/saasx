
export type Permission = string;
export type PermissionSet = ReadonlySet<Permission>;

export function toSet ( list: string[] ): PermissionSet {

    return new Set(list);

}
export function has ( set: PermissionSet, perm: Permission ): boolean {

    return set.has(perm);

}
export function hasAll ( set: PermissionSet, perms: Permission[] ): boolean {

    return perms.every((perm) => set.has(perm));

}
export function hasAny ( set: PermissionSet, perms: Permission[] ): boolean {

    return perms.some((perm) => set.has(perm));

}
