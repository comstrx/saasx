"use client";

import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuthError } from "@/hooks/use-auth-error";
import { useConfirmation } from "@/hooks/use-confirmation";
import { useAction } from "@/hooks/use-operation";
import { useToast } from "@/hooks/use-toast";
import { useLocale, useTranslations } from "@/lib/providers/intl";
import { routing } from "@/lib/spec/config";
import { localePath } from "@/lib/std/locale";
import { useUi } from "@/stores/provider";

type Step = "deactivate" | "delete";

const blockers = ["open_orders", "refund_owed", "balance"] as const;

export function useAccountClosure ( hasPassword: boolean ) {

    const t = useTranslations("accountSecurity");
    const locale = useLocale();
    const router = useRouter();
    const toast = useToast();
    const session = useUi(( state ) => state.session);
    const deactivate = useAction("account", "deactivate");
    const remove = useAction("account", "delete");
    const [step, setStep] = useState<Step | null>(null);
    const [password, setPassword] = useState("");
    const [understood, setUnderstood] = useState(false);
    const action = step === "delete" ? remove : deactivate;
    const confirmation = useConfirmation(action.error, step ?? "", action.pending, action.clear);
    const failure = useAuthError(action.error);
    const blocker = blockers.find(( key ) => action.error?.errors[key]);
    const wrong = Boolean(action.error?.errors.password);
    const mistyped = Boolean(action.error?.errors.confirm_code && !action.error.confirmation);

    function open ( choice: Step ) {

        if ( action.pending ) return;

        deactivate.clear();
        remove.clear();
        setPassword("");
        setUnderstood(false);
        setStep(choice);

    }
    function close () {

        if ( !action.pending ) setStep(null);

    }
    async function submit ( resend = false ) {

        if ( !step || action.pending || (step === "delete" && !understood) ) return;

        const proof = hasPassword ? { password }
            : confirmation.challenge && confirmation.code && !resend ? { confirm_code: confirmation.code } : {};
        const result = await action.run(proof);

        if ( !result ) return;

        toast({
            title: t(step === "delete" ? "deletedTitle" : "deactivatedTitle"),
            description: t(step === "delete" ? "deletedBody" : "deactivatedBody"),
            tone: "success",
        });
        setStep(null);
        session(null, null);
        router.replace(localePath(locale, "/", routing) as Route);

    }

    return {
        t, step, open, close, submit, password, setPassword, understood, setUnderstood, confirmation,
        pending: action.pending,
        ready: (hasPassword ? password.length > 0 : true) && (step !== "delete" || understood),
        passwordError: wrong ? t("closureWrongPassword") : undefined,
        error: blocker ? t(`closureBlocked.${blocker}`) : mistyped ? t("closureWrongCode")
            : wrong || action.error?.confirmation ? null : failure,
    };

}
