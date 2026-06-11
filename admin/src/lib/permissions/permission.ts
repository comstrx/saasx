export type Permission = string;

export type PermissionSet = ReadonlySet<Permission>;

export function toSet( list: string[] ): PermissionSet {

    return new Set(list);

}
