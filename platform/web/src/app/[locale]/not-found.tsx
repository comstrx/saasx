import { getLocale } from "@/lib/providers/intl-server";
import type { Locale } from "@/lib/spec/languages";
import { localize, screens } from "@/lib/spec/server";
import { Screen } from "./[[...path]]/screen";

export default async function NotFound () {

    const locale = await getLocale() as Locale;
    const screen = screens.find(( entry ) => entry.name === "missing");

    if ( !screen ) return null;

    return <Screen screen={localize({ ...screen, parameters: {} }, locale)} route={{ parameters: {}, query: {} }} />;

}
