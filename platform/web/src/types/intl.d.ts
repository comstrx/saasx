import type { Locale } from "@/lib/spec/languages";
import type messages from "../../messages/en.json";

declare module "next-intl" {
    interface AppConfig {
        Locale: Locale;
        Messages: typeof messages;
    }
}
