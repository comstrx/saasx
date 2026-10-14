import { defineWorld } from "@engine/world";
import { supportedLocales } from "./languages.ts";
import { countries, currency } from "./theme.ts";

export const world = defineWorld({ countries, currencies: currency.enabled, languages: supportedLocales });
