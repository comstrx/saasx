type Charge = { currency: string; amount: string };

export function cartSelection ( value: string | null ): number[] | null {

    if ( value === null ) return [];

    const parts = value.split(",");

    if ( parts.length > 100 || parts.some(( part ) => !/^[1-9]\d*$/.test(part)) ) return null;

    const ids = parts.map(Number);

    return ids.every(Number.isSafeInteger) && new Set(ids).size === ids.length ? ids.sort(( a, b ) => a - b) : null;

}
export function cartCharges ( rows: readonly Charge[] ): Charge[] | null {

    const groups = new Map<string, { units: bigint; scale: number }>();

    for ( const row of rows ) {

        if ( !/^[A-Z]{3}$/.test(row.currency) || !/^\d{1,30}(?:\.\d{1,18})?$/.test(row.amount) ) return null;

        const [whole, fraction = ""] = row.amount.split(".");
        const existing = groups.get(row.currency) ?? { units: 0n, scale: 0 };
        const scale = Math.max(existing.scale, fraction.length);
        const units = existing.units * 10n ** BigInt(scale - existing.scale)
            + BigInt(whole + fraction) * 10n ** BigInt(scale - fraction.length);

        groups.set(row.currency, { units, scale });

    }

    return [...groups].map(( [currency, value] ) => {

        const digits = value.units.toString().padStart(value.scale + 1, "0");
        const amount = value.scale ? [digits.slice(0, -value.scale), digits.slice(-value.scale)].join(".") : digits;

        return { currency, amount };

    });

}
