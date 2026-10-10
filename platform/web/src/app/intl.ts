import { headers } from "next/headers";
import { siteSettings } from "@/api/workflow/server";
import { getRequestConfig } from "@/lib/providers/intl-server";
import { routing } from "@/lib/spec/config";
import { messages } from "@/lib/spec/server";
import { choose } from "@/lib/std/object";

export default getRequestConfig(async () => {

    const [request, settings] = await Promise.all([headers(), siteSettings()]);
    const locale = choose(settings.locale.enabled, request.get("x-locale"), routing.defaultLocale);

    return { locale, messages: messages[locale], timeZone: settings.locale.timeZone };

});
