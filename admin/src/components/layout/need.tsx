"use client";

import type { ReactNode } from "react";
import { usePermissions } from "@/hooks/use-permissions";
import type { Permission } from "@/lib/std/permissions";

type NeedProps = {
    children: ReactNode;
    fallback?: ReactNode;
} & (
    | { perm: Permission; all?: never; any?: never }
    | { all: Permission[]; perm?: never; any?: never }
    | { any: Permission[]; perm?: never; all?: never }
);

export function Need ({ children, fallback = null, ...check }: NeedProps) {

    const { has, hasAll, hasAny } = usePermissions();

    const passes = () => {

        if ( check.perm !== undefined ) return has(check.perm);
        if ( check.all !== undefined )  return hasAll(check.all);
        if ( check.any !== undefined )  return hasAny(check.any);

        return false;

    };

    return passes() ? children : fallback;

}
