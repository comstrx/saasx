type Account = {
    name?: string | null; email?: string | null; phone?: string | null; language?: string | null;
    geo?: { address?: string | null; zip_code?: string | null; city?: { name?: string | null } | null;
        country?: { name?: string | null } | null } | null;
};
type Values = Readonly<Record<string, string>>;
type Fault = "email" | "phone" | "length";

export const contactKeys = ["name", "email", "phone", "language", "country", "state", "city", "zip_code", "address"] as const;
export type ContactKey = typeof contactKeys[number];

export function contactValues ( account?: Account | null ): Record<string, string> {

    const values = {
        name: account?.name, email: account?.email, phone: account?.phone, language: account?.language,
        country: account?.geo?.country?.name,
        state: "", city: account?.geo?.city?.name, zip_code: account?.geo?.zip_code, address: account?.geo?.address,
    };

    return Object.fromEntries(contactKeys.map(( key ) => [`contact.${key}`, values[key] ?? ""]));

}
export function contactInput ( values: Values ) {

    const details = values.contact_mode === "custom"
        ? Object.fromEntries(contactKeys.map(( key ) => [key, (values[`contact.${key}`] ?? "").trim()])) as Record<ContactKey, string> : {};
    const notes = values.notes?.trim();

    return { ...details, ...(notes ? { notes } : {}) };

}
export function contactErrors ( values: Values ): Record<string, Fault> {

    const errors: Record<string, Fault> = {};

    if ( (values.notes ?? "").length > 255 ) errors.notes = "length";
    if ( values.contact_mode !== "custom" ) return errors;

    for ( const key of contactKeys ) {

        const value = (values[`contact.${key}`] ?? "").trim();
        const field = `contact.${key}`;
        const limit = key === "name" ? 200 : key === "phone" ? 30 : key === "language" ? 10 : 255;

        if ( value.length > limit ) errors[field] = "length";
        else if ( key === "email" && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ) errors[field] = "email";
        else if ( key === "phone" && value && !/^\+?[\d\s().-]+$/.test(value) ) errors[field] = "phone";

    }

    return errors;

}
