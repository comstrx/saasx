import routing from "@spec/routing";
import settings from "@spec/settings";

export { routing };

export type Delivery = "server" | "static";

const selected = process.env.NEXT_PUBLIC_SPEC;

if ( !selected ) throw new Error("The build must select NEXT_PUBLIC_SPEC.");

export const identity = selected;

export const delivery: Delivery = process.env.NEXT_PUBLIC_DELIVERY === "static" ? "static" : "server";

export const preferences = {
    cookies: { language: `${selected}.locale`, currency: `${selected}.currency`, theme: `${selected}.theme` },
    choices: { languages: settings.languages, currencies: settings.currencies, themes: settings.themes },
    defaults: { language: settings.language, currency: settings.currency, theme: settings.theme },
    maxAge: 60 * 60 * 24 * 365,
};
