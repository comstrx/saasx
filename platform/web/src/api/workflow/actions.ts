"use server";

import { cookies } from "next/headers";
import { cookieOptions, type Preferences, preferenceCookies } from "../../lib/site/preferences.ts";
import type { SiteSettings } from "../../lib/site/settings.ts";
import { isCountry, isPoint } from "../../lib/std/geo.ts";
import { includes } from "../../lib/std/object.ts";
import { siteSettings } from "./server.ts";

function accepted ( { language, currency, country, location }: Preferences, settings: SiteSettings ): boolean {

    return (language === undefined || includes(settings.locale.enabled, language))
        && (currency === undefined || includes(settings.currency.enabled, currency))
        && (country === undefined || isCountry(country))
        && (location === undefined || location === null || isPoint(location));

}
export async function savePreferences ( changes: Preferences ): Promise<void> {

    const [store, settings] = await Promise.all([cookies(), siteSettings()]);

    if ( !accepted(changes, settings) ) throw new Error("Unsupported preference.");

    for ( const [name, value] of preferenceCookies(changes) ) {

        store.set(name, value, cookieOptions);

    }

}
