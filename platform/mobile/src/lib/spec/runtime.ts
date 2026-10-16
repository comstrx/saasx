import client from "@spec/client";
import config from "@spec/config";
import messages from "@spec/messages";
import schema from "@spec/schema";
import { defineRuntime, type Routed } from "engine/screen";
import type { Locale } from "./languages.ts";
import type { CompiledScreen } from "./surface.ts";

export type Matched = Routed<CompiledScreen>;

export { identity, routing } from "./config.ts";
export { client, config, messages, schema };

export const screens = schema.screens;
export const tabs = schema.tabs;
export const { screenAt, shellAt, text, localize } = defineRuntime<CompiledScreen, Locale>({ screens, shell: schema.shell, messages });
