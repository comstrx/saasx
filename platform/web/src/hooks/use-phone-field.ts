"use client";

import { useMemo } from "react";
import { useCountryOptions } from "@/hooks/use-country-options";
import { getCountryCallingCode } from "@/lib/providers/phone";

export { international, type Phone, typedPhone, validPhone } from "@/lib/providers/phone";

export function usePhoneField ( locale: string ) {

    const countries = useCountryOptions(locale);

    return useMemo(() => countries.map(( country ) => ({
        ...country, detail: `+${getCountryCallingCode(country.value)}`,
    })), [countries]);

}
