import { bind } from "@engine/context";
import { createElement, type ReactNode } from "react";
import { PreferencesProvider } from "./preferences.ts";
import { sessionStore } from "./session.ts";

export const session = bind(sessionStore);

export function SessionProvider ({ children }: { children: ReactNode }) {
    return createElement(PreferencesProvider, null, createElement(session.Provider, null, children));
}
