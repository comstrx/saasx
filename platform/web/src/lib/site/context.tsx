"use client";

import { createContext, type ReactNode, useContext } from "react";
import type { ResourceData } from "@/api/core/resource";
import type { Preferences } from "@/lib/site/preferences";
import type { SiteSettings } from "./settings";

type Site = { settings: SiteSettings; content: ResourceData<"content">; policy: ResourceData<"policy">; preferences: Preferences };

const Context = createContext<Site | null>(null);

export function SiteProvider ({ children, ...site }: Site & { children: ReactNode }) {

    return <Context.Provider value={site}>{children}</Context.Provider>;

}
export function useSite (): Site {

    const site = useContext(Context);

    if ( !site ) throw new Error("useSite requires SiteProvider.");

    return site;

}
