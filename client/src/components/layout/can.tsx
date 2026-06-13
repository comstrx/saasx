"use client";

import { Children, isValidElement, type ReactNode } from "react";
import { type Permission, usePermission } from "@/hooks/use-permission";

type CanProps = {
    perm?: Permission;
    all?: Permission[];
    any?: Permission[];
    loading?: ReactNode;
    children: ReactNode;
};

function Cannot ({ children }: { children: ReactNode }) {

    return children;

}
function split ( children: ReactNode ) {

    const granted: ReactNode[] = [];
    const denied: ReactNode[] = [];

    for ( const child of Children.toArray(children) ) {

        if ( isValidElement(child) && child.type === Cannot ) denied.push(child);
        else granted.push(child);

    }

    return { granted, denied };

}

export function Can ({ perm, all, any, loading = null, children }: CanProps) {

    const { can, canAll, canAny, isPending } = usePermission();
    const { granted, denied } = split(children);

    if ( isPending ) return loading;

    if ( perm && !can(perm) ) return denied;
    if ( all && !canAll(all) ) return denied;
    if ( any && !canAny(any) ) return denied;

    return granted;

}

Can.Cannot = Cannot;
