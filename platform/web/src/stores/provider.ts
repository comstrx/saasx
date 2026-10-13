"use client";

import { bind } from "@engine/context";
import { sessionStore } from "./session";

export const session = bind(sessionStore);
export const SessionProvider = session.Provider;
