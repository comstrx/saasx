import { useDeviceFact } from "@/hooks/use-device";
import type { Locale } from "@/lib/spec/languages";
import { preferences } from "@/stores/preferences";

export function useLocale (): Locale {

    return preferences.use(( state ) => state.language);

}
export function useTheme (): "light" | "dark" {

    const system = useDeviceFact("colorScheme");
    const chosen = preferences.use(( state ) => state.theme);

    if ( chosen === "system" ) return system === "dark" ? "dark" : "light";

    return chosen;

}
export function usePreferences () {

    return preferences.use(( state ) => state);

}
