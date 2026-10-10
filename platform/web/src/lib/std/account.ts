export type AccountPlace = {
    country?: { name?: string | null; code?: string | null } | null;
    city?: { name?: string | null } | null;
    address?: string | null; address_2?: string | null; zip_code?: string | null;
};
export type AddressDraft = { country: string; city: string; address: string; address_2: string; zip_code: string };

export function accountAddress ( place: AccountPlace | null | undefined ): AddressDraft {

    return {
        country: place?.country?.code ?? place?.country?.name ?? "",
        city: place?.city?.name ?? "", address: place?.address ?? "",
        address_2: place?.address_2 ?? "", zip_code: place?.zip_code ?? "",
    };

}
export function addressChanges ( values: AddressDraft, saved: AddressDraft ) {

    const fields = ["country", "city", "address", "address_2", "zip_code"] as const;
    const changes: Partial<AddressDraft> = {};

    for ( const key of fields ) {

        if ( values[key].trim() !== saved[key].trim() ) changes[key] = values[key].trim();

    }
    if ( changes.country !== undefined || changes.city !== undefined || changes.address !== undefined || changes.zip_code !== undefined ) {

        if ( values.country.trim() ) changes.country = values.country.trim();
        if ( values.city.trim() ) changes.city = values.city.trim();

    }

    return changes;

}
export function addressErrors ( values: AddressDraft, saved: AddressDraft, invalid: string ): Record<string, string> {

    const errors: Record<string, string> = {};
    const changes = addressChanges(values, saved);

    for ( const [field, limit] of [["country", 100], ["city", 100], ["address", 500], ["address_2", 500], ["zip_code", 40]] as const ) {

        if ( values[field].trim().length > limit ) errors[field] = invalid;

    }

    if ( changes.country !== undefined && changes.country.length < 2 ) errors.country = invalid;
    if ( changes.city !== undefined && !changes.city ) errors.city = invalid;

    return errors;

}
