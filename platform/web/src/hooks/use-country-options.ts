"use client";

import { useMemo } from "react";
import { useMounted } from "@/hooks/use-effects";
import { getCountries } from "@/lib/providers/phone";

export function useCountryOptions ( locale: string ) {

    const mounted = useMounted();

    return useMemo(() => {

        const names = mounted ? new Intl.DisplayNames([locale], { type: "region" }) : null;
        const order = mounted ? new Intl.Collator(locale) : null;

        return getCountries()
            .map(( code ) => ({ value: code, label: names?.of(code) ?? code }))
            .sort(( a, b ) => order ? order.compare(a.label, b.label) : a.value < b.value ? -1 : 1);

    }, [locale, mounted]);

}
