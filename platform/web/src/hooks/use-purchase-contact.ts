"use client";

import { useRead } from "@/hooks/use-operation";
import { contactValues } from "@/lib/std/contact";

type Options = { values: Readonly<Record<string, string>>; onChange: ( values: Record<string, string> ) => void };

export function usePurchaseContact ( { values, onChange }: Options ) {

    const account = useRead("account", "read");
    const saved = contactValues(account.data?.user);
    const details = Object.entries(saved).filter(( [key, value] ) => key !== "contact.language" && !!value);

    function choose ( mode: string ) {

        const initial = mode === "custom" && values.contact_ready !== "yes" ? { ...saved, contact_ready: "yes" } : {};

        onChange({ contact_mode: mode, ...initial });

    }

    return { account, details, choose };

}
