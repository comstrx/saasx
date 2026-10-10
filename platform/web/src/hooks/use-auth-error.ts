"use client";

import type { ApiError } from "@/api/core/error";
import { useTranslations } from "@/lib/providers/intl";

export function useAuthError ( error: ApiError | null, credential = false ): string | null {

    const t = useTranslations("auth");

    if ( !error ) return null;
    if ( error.status === 429 ) return error.retryAfter ? t("rateWait", { seconds: error.retryAfter }) : t("rateLimited");
    if ( error.status === 403 ) return t("refused");
    if ( error.status >= 500 ) return t("unavailable");
    if ( credential && (error.reason === "invalid_credentials" || error.errors._form || error.status === 401) ) return t("failed");
    if ( error.errors.otp ) return t("otpWrong");
    if ( error.errors.challenge_token ) return t("otpExpired");
    if ( error.errors.token ) return t("resetInvalid");
    if ( Object.keys(error.errors).some(( key ) => key !== "_form") ) return t("correctFields");

    return t("requestFailed");

}
