import { useEffect, useMemo } from "react";
import Notice from "@/elements/notice";
import { useLocale } from "@/hooks/use-locale";
import { usePathname, useSearchParams } from "@/hooks/use-router";
import { markReady } from "@/lib/observe/client";
import { localize, screenAt, text } from "@/lib/spec/runtime";
import { type Entry, EntryContext } from "@/stores/navigation";
import { Screen } from "./screen";

export function Page () {

    const pathname = usePathname();
    const query = useSearchParams();
    const locale = useLocale();
    const screen = useMemo(() => screenAt(pathname.split("/").filter(Boolean)), [pathname]);
    const localized = useMemo(() => (screen ? localize({ ...screen, parameters: {} }, locale) : undefined), [screen, locale]);

    useEffect(() => {

        markReady();

    }, []);

    if ( !screen || !localized ) return <Notice tone="missing" message={text({ key: "state.missing" }, locale)} />;

    return <Screen screen={localized} route={{ parameters: screen.parameters, query }} />;

}
export function EntryPage ({ entry }: { entry: Entry }) {

    return <EntryContext.Provider value={entry}><Page /></EntryContext.Provider>;

}
