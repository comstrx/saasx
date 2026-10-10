export type IdentityKind = "phone" | "email";

export type Identified = {
    kind: IdentityKind;
    value: string;
};

export type Dial = {
    iso: string;
    dial: string;
    label: string;
    popular?: boolean | undefined;
    terms: readonly string[];
};

export const dialOf = ( dials: readonly Dial[], iso: string ): string => dials.find(( entry ) => entry.iso === iso )?.dial ?? "";

export const e164 =( dial: string, digits: string ) => digits ? `${ dial }${ digits.replace(/^0+/, "") }` : "";

export const contactable = ( term: string ): boolean =>
    /^[^\s@]+@[^\s@]+\.[^\s@.]{2,}$/.test(term) || ( /^\+?[\d\s-]+$/.test(term) && term.replace(/\D/g, "").length >= 8 );
