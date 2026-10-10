import { asciiNumber } from "./number.ts";

export type AuthMode = "login" | "register" | "recover" | "reset";
export type AuthValues = {
    method: string; country: string; phone: string; email: string;
    name: string; password: string; confirm: string; promotion: string; otp: string;
};
export type PasswordPolicy = {
    password_min: number; password_max: number; password_lower: boolean;
    password_upper: boolean; password_digit: boolean; password_symbol: boolean;
};
export type Challenge = {
    token: string; channel: string; destination: string; length: number;
    retryAt: string | null; expiresAt: string | null; locked: boolean; sent: boolean;
};
type ChallengeReply = {
    challenge_token?: string; channel?: string; destination?: string; length?: number | null;
    retry_at?: string | null; expires_at?: string | null; locked?: boolean | null; status?: string;
};
type RuleKey = "required.password" | "required.phone" | "required.email" | "required.confirm"
    | "invalid.name" | "invalid.phone" | "invalid.email" | "invalid.match"
    | "passwordLength" | "passwordLower" | "passwordUpper" | "passwordDigit" | "passwordSymbol";
type Rule = { key: RuleKey; values?: Record<string, number> };

export function authValues ( country: string ): AuthValues {

    return { method: "phone", country, phone: "", email: "", name: "", password: "", confirm: "", promotion: "", otp: "" };

}
export function identityOf ( values: AuthValues, phone: string ): { email: string } | { phone: string } {

    return values.method === "email" ? { email: values.email.trim() } : {
        phone,
    };

}
export function passwordRules ( policy: PasswordPolicy ): Rule[] {

    const rules: Rule[] = [{ key: "passwordLength", values: { min: policy.password_min, max: policy.password_max } }];

    if ( policy.password_lower ) rules.push({ key: "passwordLower" });
    if ( policy.password_upper ) rules.push({ key: "passwordUpper" });
    if ( policy.password_digit ) rules.push({ key: "passwordDigit" });
    if ( policy.password_symbol ) rules.push({ key: "passwordSymbol" });

    return rules;

}
function passwordFailure ( value: string, policy: PasswordPolicy ): Rule | undefined {

    if ( !value ) return { key: "required.password" };
    if ( [...value].length < policy.password_min || [...value].length > policy.password_max ) return passwordRules(policy)[0];
    if ( policy.password_lower && !/[a-z]/.test(value) ) return { key: "passwordLower" };
    if ( policy.password_upper && !/[A-Z]/.test(value) ) return { key: "passwordUpper" };
    if ( policy.password_digit && !/\d/.test(value) ) return { key: "passwordDigit" };
    if ( policy.password_symbol && !/[\W_]/.test(value) ) return { key: "passwordSymbol" };

    return undefined;

}
export function authFailures ( values: AuthValues, mode: AuthMode, policy: PasswordPolicy, phoneValid = false ): Record<string, Rule> {

    const errors: Record<string, Rule> = {};
    const email = values.email.trim();

    if ( mode === "register" && values.name.trim().length < 2 ) errors.name = { key: "invalid.name" };

    if ( mode !== "reset" ) {

        if ( values.method === "email" || mode === "register" ) {

            if ( !email ) errors.email = { key: "required.email" };
            else if ( !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ) errors.email = { key: "invalid.email" };

        }
        if ( values.method === "phone" || mode === "register" ) {

            if ( !values.phone.trim() ) errors.phone = { key: "required.phone" };
            else if ( !phoneValid ) errors.phone = { key: "invalid.phone" };

        }

    }

    if ( mode === "login" && !values.password ) errors.password = { key: "required.password" };

    if ( mode === "register" || mode === "reset" ) {

        const password = passwordFailure(values.password, policy);

        if ( password ) errors.password = password;

        if ( !values.confirm ) errors.confirm = { key: "required.confirm" };
        else if ( values.confirm !== values.password ) errors.confirm = { key: "invalid.match" };

    }

    return errors;

}
export function otpValue ( value: string ): string {

    return asciiNumber(value).replace(/\D/g, "");

}
export function challengeOf ( reply: ChallengeReply | undefined ): Challenge | null {

    if ( !reply?.challenge_token || !reply.channel || !reply.destination || !reply.length ) return null;
    if ( !Number.isInteger(reply.length) || reply.length < 4 || reply.length > 12 ) return null;

    return {
        token: reply.challenge_token, channel: reply.channel, destination: reply.destination, length: reply.length,
        retryAt: reply.retry_at ?? null, expiresAt: reply.expires_at ?? null,
        locked: reply.locked === true, sent: reply.status === "otp_required",
    };

}
