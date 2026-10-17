"use client";

import dynamic from "next/dynamic";
import type { ReactNode } from "react";

type Props = { access: readonly string[]; guest?: boolean; redirect?: string | null; children: ReactNode };

const Guard = dynamic(() => import("./guard").then(( module ) => ({ default: module.Guard })));

export function Gate ( props: Props ) {

    return <Guard {...props} />;

}
