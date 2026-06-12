import createMiddleware from "next-intl/middleware";
import { routing } from "@/lib/utils/i18n";
import type { Guard } from "./chain";

const intl = createMiddleware(routing);

export const locale: Guard = ( request ) => intl(request);
