"use client";

import { useEffect, useState } from "react";
import { useAuthError } from "@/hooks/use-auth-error";
import { useAction } from "@/hooks/use-operation";
import { useTranslations } from "@/lib/providers/intl";
import { type AuthLinks, useAuthExit } from "./use-auth-exit";

export function useLinkAction ( mode: "confirm" | "callback", value: string, refused: boolean, links: AuthLinks ) {

    const t = useTranslations("auth");
    const action = useAction("auth", mode === "confirm" ? "confirmEmail" : "socialExchange");
    const exit = useAuthExit(links);
    const [done, setDone] = useState(false);
    const [unexpected, setUnexpected] = useState(false);
    const valid = value.length > 0 && value.length <= 4096 && !refused;
    const failure = useAuthError(action.error);
    const expired = !valid || !!action.error?.errors.token || !!action.error?.errors.code;

    useEffect(() => {

        if ( mode === "callback" && valid ) void action.run({ code: value });

    }, [mode, valid, value, action.run]);
    useEffect(() => {

        if ( mode !== "callback" || !action.result ) return;

        const reply = action.result.resource;

        if ( !("token" in reply) || !exit.finish(reply, "login") ) setUnexpected(true);

    }, [mode, action.result, exit.finish]);

    async function submit () {

        if ( action.pending || !valid ) return;

        const result = await action.run(mode === "confirm" ? { token: value } : { code: value });

        if ( result && mode === "confirm" ) setDone(true);

    }

    return {
        done, expired, submit, exit, pending: action.pending,
        error: expired ? t(mode === "confirm" ? "confirmInvalid" : "socialFailed") : unexpected ? t("unavailable") : failure,
    };

}
