"use client";

import { type ReactNode, useSyncExternalStore } from "react";
import { createPortal } from "@/lib/providers/dom";

type Props = { label: string; start: ReactNode; action: ReactNode };

const subscribe = () => () => {};
const client = () => true;
const server = () => false;

export default function ActionBar ({ label, start, action }: Props) {

    const mounted = useSyncExternalStore(subscribe, client, server);

    if ( !mounted ) return null;

    return createPortal(

        <aside aria-label={label} className="action-bar">

            <div className="min-w-0 flex-1">{start}</div>

            <div className="shrink-0">{action}</div>

        </aside>,
        document.body,

    );

}
