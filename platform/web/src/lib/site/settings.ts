import type { ResourceData } from "../../api/core/resource.ts";
import { type Locale, supportedLocales } from "../spec/languages.ts";
import { choose, includes } from "../std/object.ts";

export type Theme = "light" | "dark" | "system";
type Choice<T> = { default: T; enabled: T[] };

type Sources = {
    remote: ResourceData<"settings">;
    local: ResourceData<"settings">;
    locales?: readonly string[];
    currencies?: readonly string[];
};
export type SiteSettings = {
    locale: Choice<Locale> & { timeZone: string };
    currency: Choice<string>;
    theme: Choice<Theme>;
    motion: "system" | "reduced";
    density: "comfortable" | "compact";
    maintenance: boolean;
    maintenanceMessage: string;
};

function choice<T extends string> ( current: string, fallback: T, enabled: readonly T[] ): Choice<T> {

    return {
        default: includes(enabled, current) ? current : includes(enabled, fallback) ? fallback : enabled[0] ?? fallback,
        enabled: [...enabled],
    };

}
function pinned<T extends string> ( value: T, enabled: readonly T[] ): Choice<T> {

    return { default: value, enabled: includes(enabled, value) ? [...enabled] : [value, ...enabled] };

}
function narrow<T extends string> ( values: readonly string[] | undefined, allowed: readonly T[], fallback: readonly T[] ): T[] {

    const picked = (values ?? []).filter(( value ): value is T => includes(allowed, value));

    return picked.length ? [...new Set(picked)] : [...fallback];

}
export function composeSettings ({ remote, local, locales, currencies }: Sources): SiteSettings {

    const localLocales = narrow(local.languages, supportedLocales, supportedLocales);
    const enabledLocales = narrow(locales ?? remote.languages, localLocales, localLocales);
    const enabledCurrencies = [...new Set(currencies?.length ? currencies : remote.currencies)];

    return {
        locale: {
            ...pinned(choose(localLocales, local.language, supportedLocales[0]), enabledLocales),
            timeZone: remote.time_zone,
        },
        currency: choice(remote.currency, local.currency, enabledCurrencies.length ? enabledCurrencies : local.currencies),
        theme: choice(remote.theme, local.theme, remote.themes),
        motion: remote.motion,
        density: remote.density,
        maintenance: remote.maintenance,
        maintenanceMessage: remote.maintenance_message,
    };

}
