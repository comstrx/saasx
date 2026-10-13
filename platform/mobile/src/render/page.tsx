import { useLocalSearchParams, usePathname } from "expo-router";
import Notice from "@/elements/notice";
import { useLocale, useTheme } from "@/hooks/use-locale";
import { localize, screenAt, text } from "@/lib/spec/runtime";
import { palette } from "@/styles/theme";
import { Screen } from "./screen";

export function Page () {

    const pathname = usePathname();
    const query = useLocalSearchParams<Record<string, string | string[]>>();
    const locale = useLocale();
    const colors = palette(useTheme());
    const screen = screenAt(pathname.split("/").filter(Boolean));

    if ( !screen ) return <Notice tone="missing" message={text({ key: "state.missing" }, locale)} palette={colors} />;

    const { path: _path, ...rest } = query;

    return <Screen screen={localize({ ...screen, parameters: {} }, locale)} route={{ parameters: screen.parameters, query: rest }} />;

}
