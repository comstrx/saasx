import { chain } from "@/proxy/chain";
import { locale } from "@/proxy/locale";

export default chain([locale]);

export const config = {
    matcher: ["/((?!api|_next|_vercel|icon|apple-icon|.*\\..*).*)"],
};
