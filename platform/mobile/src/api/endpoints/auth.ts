import { z } from "zod";
import { call } from "@/api/client";
import { authUser, otpChallenge, recovered, verification } from "@/api/contracts";
import type { Identified } from "@/std/identity";

const authenticated = z.object({
    user: authUser,
    token: z.string(),
    verification: verification.nullable().optional(),
});

const outcome = z.union([ otpChallenge, authenticated ]);

const identityCheck = z.object({ exists: z.boolean().optional() }).nullable();

export type IdentityCheck = z.infer<typeof identityCheck>;

const providers = z.object({ providers: z.array(z.string()) });

const opening = z.object({ url: z.string() });

export type ChallengeRow = z.infer<typeof otpChallenge>;

export type OutcomeRow = z.infer<typeof outcome>;

export type Registration = {
    name: string;
    email: string;
    phone: string;
    password: string;
    password_confirmation: string;
    promotion_code?: string;
};

export type ResetBody =
    | { challenge_token: string; otp: string; password: string; password_confirmation: string }
    | { token: string; password: string; password_confirmation: string };

const named = ( identity: Identified ) => ({ [identity.kind]: identity.value });

export const auth = {

    check: ( identity: Identified, key: string ) =>
        call({ path: `auth/check-${ identity.kind }`, method: "POST", body: named(identity), schema: identityCheck, idempotencyKey: key }),

    login: ( identity: Identified, password: string, key: string ) =>
        call({ path: "auth/login", method: "POST", body: { ...named(identity), password }, schema: outcome, idempotencyKey: key }),

    register: ( body: Registration, key: string ) =>
        call({ path: "auth/register", method: "POST", body, schema: outcome, idempotencyKey: key }),

    verifyOtp: ( body: { challenge_token: string; otp: string }, key: string ) =>
        call({ path: "auth/verify-otp", method: "POST", body, schema: authenticated, idempotencyKey: key }),

    resend: ( body: { challenge_token: string }, key: string ) =>
        call({ path: "auth/resend", method: "POST", body, schema: otpChallenge, idempotencyKey: key }),

    recovery: ( identity: Identified, key: string ) =>
        call({ path: "auth/recovery", method: "POST", body: named(identity), schema: recovered.nullable(), idempotencyKey: key }),

    reset: ( body: ResetBody, key: string ) =>
        call({ path: "auth/reset", method: "POST", body, idempotencyKey: key }),

    confirmEmail: ( token: string, key: string ) =>
        call({ path: "auth/confirm-email", method: "POST", body: { token }, idempotencyKey: key }),

    socialProviders: async (): Promise<readonly string[]> => {

        const data = await call({ path: "auth/social/providers", schema: providers });

        return data.providers;

    },

    socialRedirect: async ( provider: string, callback: string ): Promise<string> => {

        const data = await call({
            path: `auth/social/${ provider }/redirect?callback=${ encodeURIComponent(callback) }`,
            schema: opening,
        });

        return data.url;

    },

    socialExchange: ( code: string, key: string ) =>
        call({ path: "auth/social/exchange", method: "POST", body: { code }, schema: authenticated, idempotencyKey: key }),

};
