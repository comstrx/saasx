const pattern = /^[\p{L}\p{N}-]{1,64}$/u;

export function promotionKey ( value: string | null | undefined ): string | null {

    const clean = (value ?? "").trim();

    return pattern.test(clean) ? clean : null;

}
