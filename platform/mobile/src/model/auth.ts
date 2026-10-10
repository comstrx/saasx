import { ApiError } from "@/api/client";
import type { ChallengeRow, IdentityCheck, OutcomeRow } from "@/api/endpoints/auth";
import { i18n } from "@/brand/i18n";
import type { Identified } from "@/std/identity";
import { type PasswordPolicy, strong } from "@/std/password";

export type AuthOutcome = OutcomeRow;

export const challenged = ( result: AuthOutcome ): result is ChallengeRow => "challenge_token" in result;

export type AuthIntent = "login" | "register";

const refuse = ( field: string, copy: string ): never => {

    throw new ApiError(422, "validation", "", { [field]: [ i18n.t(`auth.validation.${ copy }`) ] });

};

export const validateIdentity = ( identity: Identified ): void => {

    const valid = identity.kind === "email"
        ? identity.value.length <= 255 && /^[^\s@]+@[^\s@]+\.[^\s@.]{2,}$/.test(identity.value)
        : /^\+[1-9]\d{6,14}$/.test(identity.value);

    if ( !valid ) refuse(identity.kind, identity.kind);

};

export const acceptIdentity = ( identity: Identified, result: IdentityCheck, intent: AuthIntent ): void => {

    if ( typeof result?.exists !== "boolean" ) return;
    if ( intent === "login" && !result.exists ) refuse(identity.kind, "missing");
    if ( intent === "register" && result.exists ) refuse(identity.kind, "taken");

};

export const validateProfile = ( name: string, promotion: string ): void => {

    if ( name.trim().length < 2 || name.trim().length > 255 ) refuse("name", "name");
    if ( promotion.trim().length > 64 ) refuse("promotion_code", "promotion");

};

export const validatePasswords = ( password: string, confirmation: string, policy: PasswordPolicy ): void => {

    if ( !strong(password, policy) ) refuse("password", "password");
    if ( password !== confirmation ) refuse("password_confirmation", "confirmation");

};

export const registrationErrorStep = ( fields: Readonly<Record<string, string>> ): number | null => {

    if ( fields.email ) return 1;
    if ( fields.name || fields.phone || fields.promotion_code ) return 2;

    return null;

};

export const codeLength = ( value?: string ): number => {

    const length = Number(value);

    return Number.isInteger(length) && length >= 4 && length <= 8 ? length : 5;

};
