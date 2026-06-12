import { getRequestConfig } from "next-intl/server";
import { isLocale, routing } from "@/lib/utils/i18n";

export default getRequestConfig (async ({ requestLocale }) => {

    const requested = await requestLocale;
    const locale = isLocale(requested) ? requested : routing.defaultLocale;

    return {
        locale,
        messages: (await import(`../../messages/${locale}.json`)).default,
    };

});
