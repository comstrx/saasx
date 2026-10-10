import { ApiError, configure } from "@/api/client";
import { account } from "@/api/endpoints/account";
import { auth } from "@/api/endpoints/auth";
import { identity as brand } from "@/brand/identity";
import { accountOf } from "@/model/account";
import { challenged } from "@/model/auth";
import type { Identified } from "@/std/identity";

const baseUrl = process.env.LIVE_API_URL ?? "http://localhost:8000/v1";
const tenant = process.env.LIVE_TENANT ?? "dev.localhost";
const password = process.env.LIVE_PASSWORD ?? "";
const otp = process.env.LIVE_OTP ?? "11111";

const stamp = Date.now().toString(36);
const email = `flow-${ stamp }@${ brand.site }`;
const phone = `+9665${ String(Date.now()).slice(-8) }`;
const first = `Flow-${ stamp }-Aa1!`;
const second = `Next-${ stamp }-Bb2!`;

const byMail: Identified = { kind: "email", value: email };
const byPhone: Identified = { kind: "phone", value: phone };

const minute = 61000;
const long = 240000;

const attempt = ( name: string ) => `flow-${ name }-${ stamp }`;

const pause = ( ms: number ) => new Promise<void>(( done ) => { setTimeout(done, ms); });

const patient = async <T>( task: () => Promise<T> ): Promise<T> => {

    try {

        return await task();

    }
    catch ( failure ) {

        if ( !( failure instanceof ApiError ) || !failure.throttled ) throw failure;

        await pause(minute);

        return task();

    }

};

let live = false;

const reachable = async (): Promise<boolean> => {

    if ( !password ) return false;

    try {

        return ( await fetch(`${ baseUrl }/contract`) ).ok;

    }
    catch {

        return false;

    }

};

const enter = async ( who: Identified, secret: string, name: string ): Promise<string> => {

    const outcome = await patient(() => auth.login(who, secret, attempt(`login-${ name }`)));

    if ( !challenged(outcome) ) return outcome.token;

    const session = await patient(() => auth.verifyOtp({ challenge_token: outcome.challenge_token, otp }, attempt(`login-otp-${ name }`)));

    return session.token;

};

const refused = async ( task: () => Promise<unknown> ): Promise<ApiError> => {

    try {

        await patient(task);

    }
    catch ( failure ) {

        if ( failure instanceof ApiError ) return failure;

        throw failure;

    }

    throw new Error("the server accepted what it should refuse");

};

describe("live flows · auth", () => {

    beforeAll(async () => {

        live = await reachable();

        configure({ baseUrl, tenant, locale: "en", currency: "USD", token: null, onExpire: null });

    }, 30000);

    test("register → resend → verify opens a session on the new account", async () => {

        if ( !live ) return;

        const outcome = await patient(() => auth.register({ name: "Flow Tester", email, phone, password: first, password_confirmation: first }, attempt("register")));

        let token: string;

        if ( challenged(outcome) ) {

            const again = await patient(() => auth.resend({ challenge_token: outcome.challenge_token }, attempt("resend")));
            const session = await patient(() => auth.verifyOtp({ challenge_token: again.challenge_token, otp }, attempt("verify")));

            token = session.token;

        }
        else token = outcome.token;

        configure({ token });

        expect(accountOf(await account.profile()).email).toBe(email);

    }, long);

    test("logout kills the token — the next call answers unauthenticated", async () => {

        if ( !live ) return;

        await account.logout();

        const failure = await refused(() => account.profile());

        expect(failure.unauthenticated).toBe(true);

        configure({ token: null });

    }, long);

    test("a wrong password is refused, the right one signs in by email and by phone", async () => {

        if ( !live ) return;

        const failure = await refused(() => auth.login(byMail, `${ first }x`, attempt("wrong")));

        expect(failure.answered).toBe(true);

        configure({ token: await enter(byMail, first, "mail") });

        expect(accountOf(await account.profile()).email).toBe(email);

        await account.logout();
        configure({ token: await enter(byPhone, first, "phone") });

        expect(accountOf(await account.profile()).phone).toBe(phone);

        await account.logout();
        configure({ token: null });

    }, long);

    test("recovery → reset by code → the new password signs in, the old one does not", async () => {

        if ( !live ) return;

        const mailed = await patient(() => auth.recovery(byMail, attempt("recovery-mail")));
        const answer = mailed && mailed.status !== "link_sent"
            ? mailed
            : await patient(() => auth.recovery(byPhone, attempt("recovery-phone")));

        if ( !answer || answer.status === "link_sent" ) throw new Error("recovery never offered a code");

        await patient(() => auth.reset({ challenge_token: answer.challenge_token, otp, password: second, password_confirmation: second }, attempt("reset")));

        await refused(() => auth.login(byMail, first, attempt("old")));

        configure({ token: await enter(byMail, second, "second") });

        expect(accountOf(await account.profile()).email).toBe(email);

    }, long);

    test("social providers answer a list", async () => {

        if ( !live ) return;

        expect(Array.isArray(await auth.socialProviders())).toBe(true);

    }, 30000);

});
