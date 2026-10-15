import { createHistory, type Entry } from "engine/history";
import { createContext } from "react";
import { config } from "@/lib/spec/runtime";

export type { Entry };

export const history = createHistory("/", { scheme: config.settings.app.scheme });
export const EntryContext = createContext<Entry | null>(null);
