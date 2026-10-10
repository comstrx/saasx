import { useColorScheme } from "react-native";
import { usePrefs } from "@/store/prefs";
import { type AppTheme, themes } from "@/theme";

type Theme = AppTheme;

export function useTheme (): Theme {

    const mode = usePrefs(( state ) => state.theme );
    const system = useColorScheme();

    const name = mode === "system" ? system === "dark" ? "dark" : "light" : mode;

    return themes[name] as Theme;

}
