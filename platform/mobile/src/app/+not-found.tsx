import Notice from "@/elements/notice";
import { useLocale, useTheme } from "@/hooks/use-locale";
import { text } from "@/lib/spec/runtime";
import { palette } from "@/styles/theme";

export default function NotFound () {
    const locale = useLocale();

    return <Notice tone="missing" message={text({ key: "state.missing" }, locale)} palette={palette(useTheme())} />;
}
