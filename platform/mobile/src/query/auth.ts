import { useMutation, useQuery } from "@tanstack/react-query";
import { auth, type Registration, type ResetBody } from "@/api/endpoints/auth";
import type { Identified } from "@/std/identity";
import { key } from "@/std/key";

const hour = 3600000;

const authKeys = {
    providers: [ "auth", "providers" ] as const,
};

export function useSocialProviders () {

    return useQuery({
        queryKey: authKeys.providers,
        queryFn: auth.socialProviders,
        staleTime: hour,
        gcTime: hour * 24,
        retry: false,
    });

}

export function useAuthCheck () {

    return useMutation({
        networkMode: "always",
        gcTime: 0,
        retry: false,
        mutationFn: ({ identity, attempt }: { identity: Identified; attempt: string }) => auth.check(identity, attempt),
        meta: { quiet: true },
    });

}

export function useLogin () {

    return useMutation({
        networkMode: "always",
        gcTime: 0,
        retry: false,
        mutationFn: ({ identity, password, attempt }: { identity: Identified; password: string; attempt: string }) =>
            auth.login(identity, password, attempt),
        meta: { quiet: true },
    });

}

export function useRegister () {

    return useMutation({
        networkMode: "always",
        gcTime: 0,
        retry: false,
        mutationFn: ({ body, attempt }: { body: Registration; attempt: string }) => auth.register(body, attempt),
        meta: { quiet: true },
    });

}

export function useVerifyOtp () {

    return useMutation({
        networkMode: "always",
        gcTime: 0,
        retry: false,
        mutationFn: ({ challenge, otp, attempt }: { challenge: string; otp: string; attempt: string }) =>
            auth.verifyOtp({ challenge_token: challenge, otp }, attempt),
        meta: { quiet: true },
    });

}

export function useResendOtp () {

    return useMutation({
        networkMode: "always",
        gcTime: 0,
        retry: false,
        mutationFn: ({ challenge, attempt }: { challenge: string; attempt: string }) => auth.resend({ challenge_token: challenge }, attempt),
        meta: { quiet: true },
    });

}

export function useRecovery () {

    return useMutation({
        networkMode: "always",
        gcTime: 0,
        retry: false,
        mutationFn: ({ identity, attempt }: { identity: Identified; attempt: string }) => auth.recovery(identity, attempt),
        meta: { quiet: true },
    });

}

export function useResetPassword () {

    return useMutation({
        networkMode: "always",
        gcTime: 0,
        retry: false,
        mutationFn: ({ body, attempt }: { body: ResetBody; attempt: string }) => auth.reset(body, attempt),
        meta: { quiet: true },
    });

}

export function useSocialRedirect () {

    return useMutation({
        networkMode: "always",
        gcTime: 0,
        retry: false,
        mutationFn: ({ provider, callback }: { provider: string; callback: string }) => auth.socialRedirect(provider, callback),
        meta: { quiet: true },
    });

}

export function useSocialExchange () {

    return useMutation({
        networkMode: "always",
        gcTime: 0,
        retry: false,
        mutationFn: ( code: string ) => auth.socialExchange(code, key.attempt("social-exchange")),
        meta: { quiet: true },
    });

}
