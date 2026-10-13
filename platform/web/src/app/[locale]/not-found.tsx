import Notice from "@/elements/notice";
import { requestLocale } from "@/lib/site/request";
import type { Locale } from "@/lib/spec/languages";
import { localize, screens, text } from "@/lib/spec/server";
import { Screen } from "./[[...path]]/screen";

export default async function NotFound () {

    const locale = await requestLocale() as Locale;
    const screen = screens.find(( entry ) => entry.name === "missing");

    if ( !screen ) return <Notice tone="missing" message={text({ key: "state.missing" }, locale)} />;

    return <Screen screen={localize({ ...screen, parameters: {} }, locale)} route={{ parameters: {}, query: {} }} />;

}
