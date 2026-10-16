import "server-only";

import config from "@spec/config";
import messages from "@spec/messages";
import schema from "@spec/schema";
import { defineRuntime, type Routed } from "engine/screen";
import type { Locale } from "@/lib/spec/languages";
import type { CompiledScreen } from "@/lib/spec/surface";

export type Matched = Routed<CompiledScreen>;

export { identity, routing } from "./config.ts";
export { config, messages };

export const crawlable = config.content.seo.robots.allow.length > 0;
export const screens = schema.screens;
export const { screenAt, shellAt, text, localize } = defineRuntime<CompiledScreen, Locale>({ screens, shell: schema.shell, messages });
