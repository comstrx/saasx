import { defineWorld } from "@engine/world";
import flags from "@spec/flags";
import { supportedLocales } from "./languages.ts";
import { countries, currency } from "./theme.ts";

export const world = defineWorld({ countries, currencies: currency.enabled, languages: supportedLocales });

export function flagSource ( code: string ): number | undefined {

    return flags[code.toLowerCase()];

}
