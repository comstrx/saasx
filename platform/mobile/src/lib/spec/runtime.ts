import { type Localized, localizeTree, matchScreen, messageText, type Routed, type SpecText } from "@engine/spec";
import client from "@spec/client";
import config from "@spec/config";
import messages from "@spec/messages";
import schema from "@spec/schema";
import type { Locale } from "./languages.ts";
import type { CompiledScreen } from "./surface.ts";

export type Matched = Routed<CompiledScreen>;

export { identity, routing } from "./config.ts";
export { client, config, messages, schema };

export const screens = schema.screens;
export const shell = schema.shell;
export const tabs = schema.tabs;

export function screenAt ( segments: readonly string[] = [] ): Matched | undefined {

    return matchScreen(screens, segments);

}
export function text ( value: SpecText, locale: Locale ): string {

    return messageText(value, messages[locale], locale);

}
export function localize<T> ( value: T, locale: Locale ): Localized<T> {

    return localizeTree(value, messages[locale], locale);

}
