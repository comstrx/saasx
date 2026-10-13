import { defineWorld } from "@engine/world";
import flags from "@spec/flags";
import { supportedLocales } from "./languages.ts";
import { countries, currency } from "./theme.ts";

export const world = defineWorld({ countries, currencies: currency.enabled, languages: supportedLocales, flags: { folder: "images/flag", format: "webp" } });

export function flagSource ( code: string ): number | undefined {

    return flags[code.toLowerCase()];

}
