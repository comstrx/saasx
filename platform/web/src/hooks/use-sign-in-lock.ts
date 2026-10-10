"use client";

import { useState } from "react";
import { useAuthError } from "@/hooks/use-auth-error";
import { useConfirmation } from "@/hooks/use-confirmation";
import { useAction } from "@/hooks/use-operation";
import { useToast } from "@/hooks/use-toast";
import { useTranslations } from "@/lib/providers/intl";

export function useSignInLock ( hasPassword: boolean ) {

    const t = useTranslations("accountSecurity");
    const toast = useToast();
    const unlock = useAction("account", "unlock");
    const [open, setOpen] = useState(false);
    const [password, setPassword] = useState("");
    const confirmation = useConfirmation(unlock.error, "unlock", unlock.pending, unlock.clear);
    const failure = useAuthError(unlock.error);

    function ask () {

        unlock.clear();
        setPassword("");
        setOpen(true);

    }
    function close () {

        if ( !unlock.pending ) setOpen(false);

    }
    async function submit ( resend = false ) {

        if ( unlock.pending ) return;

        const proof = hasPassword ? { password }
            : confirmation.challenge && confirmation.code && !resend ? { confirm_code: confirmation.code } : {};

        if ( !(await unlock.run(proof)) ) return;

        setOpen(false);
        setPassword("");
        toast({ title: t("unlocked"), tone: "success" });

    }

    return {
        t, open, password, setPassword, submit, confirmation,
        pending: unlock.pending,
        error: unlock.error?.errors.password ? t("wrongPassword") : failure,
        ask, close,
    };

}
