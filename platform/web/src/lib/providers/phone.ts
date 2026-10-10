import {
    type CountryCode, getCountries, isValidPhoneNumber, parsePhoneNumberWithError,
} from "libphonenumber-js/min";
import { asciiNumber } from "../std/number.ts";

export {
    AsYouType, type CountryCode, getCountries, getCountryCallingCode, isValidPhoneNumber, parsePhoneNumberWithError,
} from "libphonenumber-js/min";

export type Phone = { country: string; number: string };

export function phoneCountry ( value: string | undefined, fallback: string ): string {

    const countries = getCountries();

    return value && countries.includes(value as CountryCode) ? value : fallback;

}
export function international ( phone: Phone ): string {

    const typed = asciiNumber(phone.number).trim().replace(/^00/, "+");
    const country = getCountries().includes(phone.country as CountryCode) ? phone.country as CountryCode : undefined;

    try {

        return parsePhoneNumberWithError(typed, { defaultCountry: country, extract: false }).number;

    }
    catch {

        return typed;

    }

}
export function validPhone ( phone: Phone ): boolean {

    return isValidPhoneNumber(international(phone));

}
export function typedPhone ( value: string, phone: Phone ): Phone {

    const full = international({ ...phone, number: value });

    if ( !/^\s*(\+|00)/.test(asciiNumber(value)) || !isValidPhoneNumber(full) ) return { ...phone, number: value };

    const parsed = parsePhoneNumberWithError(full);

    return { country: parsed.country ?? phone.country, number: parsed.nationalNumber };

}
