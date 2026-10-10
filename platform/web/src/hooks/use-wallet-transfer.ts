"use client";

import { useState } from "react";
import { useConfirmation } from "@/hooks/use-confirmation";
import { useFormFields } from "@/hooks/use-form-fields";
import { useAction } from "@/hooks/use-operation";
import { useTranslations } from "@/lib/providers/intl";

const decimalAmount = /^\d+(?:\.\d{1,2})?$/;

export function useWalletTransfer ( onDone: () => void ) {

    const t = useTranslations("wallet");
    const resolve = useAction("wallet", "recipient");
    const transfer = useAction("wallet", "transfer");
    const [person, setPerson] = useState<{ id: number; name: string } | null>(null);
    const [done, setDone] = useState(false);
    const form = useFormFields({
        initial: { recipient: "", amount: "" }, failure: transfer.error ?? resolve.error,
        clear: () => { transfer.clear(); resolve.clear(); },
        validate: ( values ): Record<string, string> => person
            ? !decimalAmount.test(values.amount.trim()) || Number(values.amount) <= 0 ? { amount: t("invalidAmount") } : {}
            : values.recipient.trim().length < 3 ? { recipient: t("recipientHint") } : {},
    });
    const confirmation = useConfirmation(transfer.error, `${person?.id ?? 0}:${form.values.amount}`, transfer.pending, transfer.clear);

    async function find () {

        if ( !form.check() ) return;

        const answer = await resolve.run({ recipient: form.values.recipient.trim() });

        if ( answer ) setPerson({ id: answer.resource.id, name: answer.resource.name || form.values.recipient.trim() });

    }
    async function send ( resend = false ) {

        if ( !person || !form.check() ) return;

        const answer = await transfer.run({
            recipient: form.values.recipient.trim(), amount: form.values.amount.trim(),
            ...(confirmation.challenge && confirmation.code && !resend ? { confirm_code: confirmation.code } : {}),
        });

        if ( answer ) {

            setDone(true);
            onDone();

        }

    }
    function reset () {

        setPerson(null);
        setDone(false);
        form.reset({ recipient: "", amount: "" });

    }

    const failure = resolve.error?.status === 404 ? t("notFound")
        : (resolve.error ?? transfer.error) && !transfer.error?.confirmation
            ? Object.values((resolve.error ?? transfer.error)?.errors ?? {}).flat()[0] || t("failed") : null;

    return {
        t, form, person, done, confirmation, find, send, reset, failure,
        change: () => { setPerson(null); resolve.clear(); transfer.clear(); },
        pending: resolve.pending || transfer.pending,
    };

}
